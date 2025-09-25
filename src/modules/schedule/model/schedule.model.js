import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const SCHEDULE_COLLECTION_NAME = 'schedules'
const SCHEDULE_COLLECTION_SCHEMA = Joi.object({
  trainerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})
const validateBeforeCreate = async (data) => {
  return await SCHEDULE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })

    const newDataToAdd = {
      ...validData,
      trainerId: new ObjectId(String(validData.trainerId)),
    }

    const createdSchedule = await GET_DB().collection(SCHEDULE_COLLECTION_NAME).insertOne(newDataToAdd)
    return createdSchedule
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (scheduleId) => {
  try {
    const schedule = await GET_DB()
      .collection(SCHEDULE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(scheduleId)),
      })
    return schedule
  } catch (error) {
    throw new Error(error)
  }
}

const getListScheduleByTrainerId = async (trainerId) => {
  try {
    const listSchedule = await GET_DB()
      .collection(SCHEDULE_COLLECTION_NAME)
      .aggregate([
        // Match schedules for the specific trainer
        {
          $match: {
            trainerId: new ObjectId(String(trainerId)),
            _destroy: false,
          },
        },
        // Left join with bookings to get booking info and user reference
        {
          $lookup: {
            from: 'bookings', // or BOOKING_COLLECTION_NAME
            localField: '_id',
            foreignField: 'scheduleId',
            as: 'booking',
          },
        },
        // Unwind booking array (use preserveNullAndEmptyArrays for left join behavior)
        {
          $unwind: {
            path: '$booking',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Left join with users to get member fullName
        {
          $lookup: {
            from: 'users', // or USER_COLLECTION_NAME
            localField: 'booking.userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        // Unwind user array
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Left join with locations to get location name
        {
          $lookup: {
            from: 'locations', // or LOCATION_COLLECTION_NAME
            localField: 'booking.locationId',
            foreignField: '_id',
            as: 'location',
          },
        },
        // Unwind location array
        {
          $unwind: {
            path: '$location',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Project the final structure with required fields
        {
          $project: {
            _id: 1,
            trainerId: 1,
            startTime: 1,
            endTime: 1,
            location: {
              $ifNull: ['$location.name', ''],
            },
            member: {
              $ifNull: ['$user.fullName', ''],
            },
            note: {
              $ifNull: ['$booking.note', ''],
            },
          },
        },
        // Sort by start time (optional)
        {
          $sort: {
            startTime: 1,
          },
        },
      ])
      .toArray()

    return listSchedule
  } catch (error) {
    throw new Error(error)
  }
}

const checkConflict = async (trainerId, startTime, endTime) => {
  try {
    // ép input về string ISO (giả định bạn đang lưu ISO string trong DB)
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid startTime or endTime')
    }
    if (start >= end) {
      throw new Error('startTime must be before endTime')
    }

    // convert sang ISO string để so với DB
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    // Query overlap: existing.start < newEnd && existing.end > newStart
    const conflict = await GET_DB()
      .collection(SCHEDULE_COLLECTION_NAME)
      .findOne({
        trainerId: new ObjectId(String(trainerId)),
        _destroy: false,
        startTime: { $lt: endISO },
        endTime: { $gt: startISO },
      })

    return conflict
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (scheduleId, updateData) => {
  try {
    const updatedSchedule = await GET_DB()
      .collection(SCHEDULE_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(scheduleId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updatedSchedule
  } catch (error) {
    throw new Error(error)
  }
}

const deleteSchedule = async (scheduleId) => {
  try {
    const updatedSchedule = await GET_DB()
      .collection(SCHEDULE_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(scheduleId)) })
    return updatedSchedule.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

export const scheduleModel = {
  SCHEDULE_COLLECTION_NAME,
  SCHEDULE_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getListScheduleByTrainerId,
  checkConflict,
  updateInfo,
  deleteSchedule,
}
