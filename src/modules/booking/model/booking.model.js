import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { BOOKING_STATUS } from '~/utils/constants.js'
import { scheduleModel } from '~/modules/schedule/model/schedule.model'

const BOOKING_COLLECTION_NAME = 'bookings'
const BOOKING_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  scheduleId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  status: Joi.string()
    .valid(BOOKING_STATUS.BOOKING, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.PENDING, BOOKING_STATUS.CANCELLED)
    .default(BOOKING_STATUS.PENDING),
  price: Joi.number().min(0).required(),
  title: Joi.string().trim().strict().allow('').default(''),
  note: Joi.string().trim().strict().allow('').default(''),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await BOOKING_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })

    const newBookingToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
      scheduleId: new ObjectId(String(validData.scheduleId)),
      locationId: new ObjectId(String(validData.locationId)),
    }

    const createdBooking = await GET_DB().collection(BOOKING_COLLECTION_NAME).insertOne(newBookingToAdd)
    return createdBooking
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (bookingId) => {
  try {
    const booking = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(bookingId)),
      })
    return booking
  } catch (error) {
    throw new Error(error)
  }
}

const getBookingsByUserId = async (userId) => {
  try {
    const bookings = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .find({
        userId: new ObjectId(String(userId)),
      })
      .toArray()
    return bookings
  } catch (error) {
    throw new Error(error)
  }
}

const getUpcomingBookingsByUserId = async (userId) => {
  try {
    const now = new Date()

    const result = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .aggregate([
        // Match bookings for specific user from current time to future
        {
          $match: {
            userId: new ObjectId(String(userId)),
            _destroy: false,
            // Note: You'll need to add scheduleTime field to booking schema
            // or join with schedules to get the actual schedule time
          },
        },
        // Join with schedules to get schedule timing information
        {
          $lookup: {
            from: 'schedules',
            localField: 'scheduleId',
            foreignField: '_id',
            as: 'schedule',
          },
        },
        // Unwind schedule array
        {
          $unwind: '$schedule',
        },
        // Filter for upcoming sessions only (after current time)
        {
          $match: {
            'schedule.startTime': { $gte: now.toISOString() },
            'schedule._destroy': false,
          },
        },
        // Join with trainers collection
        {
          $lookup: {
            from: 'trainers',
            localField: 'schedule.trainerId',
            foreignField: '_id',
            as: 'trainer',
          },
        },
        // Unwind trainer array
        {
          $unwind: '$trainer',
        },
        // Join with users collection to get trainer's user info
        {
          $lookup: {
            from: 'users',
            localField: 'trainer.userId',
            foreignField: '_id',
            as: 'trainerUser',
          },
        },
        // Unwind trainer user array
        {
          $unwind: '$trainerUser',
        },
        // Join with locations collection
        {
          $lookup: {
            from: 'locations',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        },
        // Unwind location array
        {
          $unwind: '$location',
        },
        // Join with reviews to calculate trainer rating
        {
          $lookup: {
            from: 'reviews',
            localField: 'trainer._id',
            foreignField: 'trainerId',
            as: 'reviews',
          },
        },
        // Group by trainer to aggregate all sessions for each trainer
        {
          $group: {
            _id: '$trainer._id',
            trainer: { $first: '$trainer' },
            trainerUser: { $first: '$trainerUser' },
            reviews: { $first: '$reviews' },
            allSessions: {
              $push: {
                bookingId: '$_id',
                startTime: '$schedule.startTime',
                endTime: '$schedule.endTime',
                location: {
                  _id: '$location._id',
                  name: '$location.name',
                  address: '$location.address',
                },
                status: '$status',
                price: '$price',
                note: '$note',
              },
            },
            createdAt: { $first: '$createdAt' },
          },
        },
        // Add calculated fields
        {
          $addFields: {
            // Calculate average rating from reviews
            'trainer.rating': {
              $cond: {
                if: { $gt: [{ $size: '$reviews' }, 0] },
                then: {
                  $round: [
                    {
                      $avg: {
                        $map: {
                          input: {
                            $filter: {
                              input: '$reviews',
                              cond: { $eq: ['$$this._destroy', false] },
                            },
                          },
                          as: 'review',
                          in: '$$review.rating',
                        },
                      },
                    },
                    1,
                  ],
                },
                else: 0,
              },
            },
          },
        },
        // Project the final structure to match your mock data
        {
          $project: {
            _id: 0,
            trainer: {
              trainerId: '$trainer._id',
              userInfo: {
                fullName: '$trainerUser.fullName',
                avatar: '$trainerUser.avatar',
                email: '$trainerUser.email',
                phone: '$trainerUser.phone',
              },
              specialization: '$trainer.specialization',
              rating: '$trainer.rating',
              pricePerSession: '$trainer.pricePerSession',
            },
            allSessions: 1,
          },
        },
        // Sort by earliest upcoming session
        {
          $sort: {
            'allSessions.startTime': 1,
          },
        },
      ])
      .toArray()

    return result
  } catch (error) {
    throw new Error(`Error fetching upcoming bookings: ${error.message}`)
  }
}

// Alternative simpler version if you don't need complex grouping
const getUpcomingBookingsByUserIdSimple = async (userId) => {
  try {
    const now = new Date()

    const bookings = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .aggregate([
        // Match user's bookings
        {
          $match: {
            userId: new ObjectId(String(userId)),
            _destroy: false,
          },
        },
        // Join with schedules
        {
          $lookup: {
            from: 'schedules',
            localField: 'scheduleId',
            foreignField: '_id',
            as: 'schedule',
          },
        },
        { $unwind: '$schedule' },
        // Filter for upcoming only
        {
          $match: {
            'schedule.startTime': { $gte: now.toISOString() },
            'schedule._destroy': false,
          },
        },
        // Join with trainer info
        {
          $lookup: {
            from: 'trainers',
            localField: 'schedule.trainerId',
            foreignField: '_id',
            as: 'trainer',
          },
        },
        { $unwind: '$trainer' },
        // Join with trainer user info
        {
          $lookup: {
            from: 'users',
            localField: 'trainer.userId',
            foreignField: '_id',
            as: 'trainerUser',
          },
        },
        { $unwind: '$trainerUser' },
        // Join with location
        {
          $lookup: {
            from: 'locations',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        },
        { $unwind: '$location' },
        // Project final structure
        {
          $project: {
            bookingId: '$_id',
            startTime: '$schedule.startTime',
            endTime: '$schedule.endTime',
            trainer: {
              trainerId: '$trainer._id',
              fullName: '$trainerUser.fullName',
              avatar: '$trainerUser.avatar',
              specialization: '$trainer.specialization',
              pricePerSession: '$trainer.pricePerSession',
            },
            location: {
              _id: '$location._id',
              name: '$location.name',
              address: '$location.address',
            },
            status: 1,
            note: 1,
            createdAt: 1,
          },
        },
        // Sort by start time
        {
          $sort: { startTime: 1 },
        },
      ])
      .toArray()

    return bookings
  } catch (error) {
    throw new Error(`Error fetching upcoming bookings: ${error.message}`)
  }
}

const checkUserBookingConflict = async (userId, scheduleId) => {
  try {
    // First, get the schedule details to know the time range
    const schedule = await GET_DB()
      .collection(scheduleModel.SCHEDULE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(scheduleId)),
        _destroy: false,
      })

    // If schedule doesn't exist or is destroyed, no conflict can occur
    if (!schedule) {
      return null
    }

    const { startTime, endTime } = schedule

    // Find if user has any existing bookings that overlap with this time slot
    const conflict = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .aggregate([
        // Match user's active bookings
        {
          $match: {
            userId: new ObjectId(String(userId)),
            _destroy: false,
            // Optionally exclude cancelled bookings from conflict check
            status: { $ne: BOOKING_STATUS.CANCELLED },
          },
        },
        // Join with schedules to get timing information
        {
          $lookup: {
            from: 'schedules',
            localField: 'scheduleId',
            foreignField: '_id',
            as: 'schedule',
          },
        },
        // Unwind the schedule array
        {
          $unwind: '$schedule',
        },
        // Filter for time overlap and active schedules
        {
          $match: {
            'schedule._destroy': false,
            // Overlap condition: existing.start < newEnd && existing.end > newStart
            'schedule.startTime': { $lt: endTime },
            'schedule.endTime': { $gt: startTime },
          },
        },
        // Limit to first conflict found (we only need to know if one exists)
        {
          $limit: 1,
        },
        // Project relevant information about the conflict
        {
          $project: {
            bookingId: '$_id',
            scheduleId: '$scheduleId',
            startTime: '$schedule.startTime',
            endTime: '$schedule.endTime',
            status: '$status',
          },
        },
      ])
      .toArray()

    // Return the first conflict if found, otherwise null
    return conflict.length > 0 ? conflict[0] : null
  } catch (error) {
    throw new Error(`Error checking booking conflict: ${error.message}`)
  }
}

const getAllBookings = async () => {
  try {
    const bookings = await GET_DB().collection(BOOKING_COLLECTION_NAME).find({}).toArray()
    return bookings
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (bookingId, updateData) => {
  try {
    const updated = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(bookingId)) },
        { $set: { ...updateData, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBooking = async (bookingId) => {
  try {
    const deleted = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(bookingId)) })
    return deleted.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

// Soft delete by setting _destroy flag
const softDeleteBooking = async (bookingId) => {
  try {
    const updated = await GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(bookingId)) },
        { $set: { _destroy: true, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingModel = {
  BOOKING_COLLECTION_NAME,
  BOOKING_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getBookingsByUserId,
  getAllBookings,
  getUpcomingBookingsByUserId,
  getUpcomingBookingsByUserIdSimple,
  checkUserBookingConflict,
  updateInfo,
  deleteBooking,
  softDeleteBooking,
}
