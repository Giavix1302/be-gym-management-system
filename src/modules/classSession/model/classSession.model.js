import { ObjectId } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { subscriptionModel } from '~/modules/subscription/model/subscription.model'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { trainerModel } from '~/modules/trainer/model/trainer.model'
import { userModel } from '~/modules/user/model/user.model'
import { roomModel } from '~/modules/room/model/room.model'
import { classModel } from '~/modules/class/model/class.model'

const CLASS_SESSION_COLLECTION_NAME = 'class_sessions'
const CLASS_SESSION_COLLECTION_SCHEMA = Joi.object({
  classId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  trainers: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  users: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  roomId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  startTime: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
  title: Joi.string().trim().strict().required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await CLASS_SESSION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    // Convert classId to ObjectId
    if (validData.classId) {
      validData.classId = new ObjectId(String(validData.classId))
    }

    // Convert trainer IDs to ObjectId if they're strings
    if (validData.trainers && validData.trainers.length > 0) {
      validData.trainers = validData.trainers.map((id) => new ObjectId(String(id)))
    }

    // Convert user IDs to ObjectId if they're strings
    if (validData.users && validData.users.length > 0) {
      validData.users = validData.users.map((id) => new ObjectId(String(id)))
    }

    // Convert roomId to ObjectId
    if (validData.roomId) {
      validData.roomId = new ObjectId(String(validData.roomId))
    }

    const createdClassSession = await GET_DB().collection(CLASS_SESSION_COLLECTION_NAME).insertOne(validData)
    return createdClassSession
  } catch (error) {
    throw new Error(error)
  }
}

const addUserToClassSessions = async (userId, classId) => {
  try {
    // Convert IDs to ObjectId
    const userObjectId = new ObjectId(String(userId))
    const classObjectId = new ObjectId(String(classId))

    // Get current time in ISO format
    const currentTime = new Date().toISOString()

    // Update only upcoming class sessions (where startTime >= current time)
    const result = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .updateMany(
        {
          classId: classObjectId,
          startTime: { $gte: currentTime },
          _destroy: false,
        },
        {
          $addToSet: { users: userObjectId },
          $set: { updatedAt: Date.now() },
        }
      )

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (classSessionId) => {
  try {
    const classSession = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(classSessionId)),
      })
    return classSession
  } catch (error) {
    throw new Error(error)
  }
}

const getList = async () => {
  try {
    const listClassSessions = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .find({ _destroy: false })
      .toArray()
    return listClassSessions
  } catch (error) {
    throw new Error(error)
  }
}

const getListWithDetails = async () => {
  try {
    const db = await GET_DB()
    const listClassSessions = await db
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .aggregate([
        {
          $match: { _destroy: false },
        },
        {
          $lookup: {
            from: classModel.CLASS_COLLECTION_NAME,
            localField: 'classId',
            foreignField: '_id',
            as: 'classDetails',
          },
        },
        {
          $lookup: {
            from: trainerModel.TRAINER_COLLECTION_NAME,
            localField: 'trainers',
            foreignField: '_id',
            as: 'trainerDetails',
          },
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'users',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $lookup: {
            from: roomModel.ROOM_COLLECTION_NAME,
            localField: 'roomId',
            foreignField: '_id',
            as: 'roomDetails',
          },
        },
        {
          $addFields: {
            totalTrainers: { $size: '$trainerDetails' },
            totalUsers: { $size: '$userDetails' },
            classInfo: { $arrayElemAt: ['$classDetails', 0] },
            roomInfo: { $arrayElemAt: ['$roomDetails', 0] },
          },
        },
        {
          $project: {
            title: 1,
            startTime: 1,
            endTime: 1,
            totalTrainers: 1,
            totalUsers: 1,
            'classInfo._id': 1,
            'classInfo.name': 1,
            'classInfo.classType': 1,
            'roomInfo._id': 1,
            'roomInfo.name': 1,
            'roomInfo.capacity': 1,
            'trainerDetails._id': 1,
            'trainerDetails.name': 1,
            'trainerDetails.avatar': 1,
            'userDetails._id': 1,
            'userDetails.name': 1,
            'userDetails.avatar': 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { startTime: 1 },
        },
      ])
      .toArray()

    return listClassSessions
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (classSessionId, updateData) => {
  try {
    // Convert classId to ObjectId if present
    if (updateData.classId) {
      updateData.classId = new ObjectId(String(updateData.classId))
    }

    // Convert trainer IDs to ObjectId if present
    if (updateData.trainers && updateData.trainers.length > 0) {
      updateData.trainers = updateData.trainers.map((id) => new ObjectId(String(id)))
    }

    // Convert user IDs to ObjectId if present
    if (updateData.users && updateData.users.length > 0) {
      updateData.users = updateData.users.map((id) => new ObjectId(String(id)))
    }

    // Convert roomId to ObjectId if present
    if (updateData.roomId) {
      updateData.roomId = new ObjectId(String(updateData.roomId))
    }

    const updatedClassSession = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(classSessionId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updatedClassSession
  } catch (error) {
    throw new Error(error)
  }
}

const deleteClassSession = async (classSessionId) => {
  try {
    const result = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(classSessionId)) })
    return result.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

const softDelete = async (classSessionId) => {
  try {
    const result = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(classSessionId)) },
        { $set: { _destroy: true, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getSessionsByClass = async (classId) => {
  try {
    const sessions = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .find({
        classId: new ObjectId(String(classId)),
        _destroy: false,
      })
      .toArray()
    return sessions
  } catch (error) {
    throw new Error(error)
  }
}

const getSessionsByTrainer = async (trainerId) => {
  try {
    const sessions = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .find({
        trainers: new ObjectId(String(trainerId)),
        _destroy: false,
      })
      .toArray()
    return sessions
  } catch (error) {
    throw new Error(error)
  }
}

const getSessionsByRoom = async (roomId) => {
  try {
    const sessions = await GET_DB()
      .collection(CLASS_SESSION_COLLECTION_NAME)
      .find({
        roomId: new ObjectId(String(roomId)),
        _destroy: false,
      })
      .toArray()
    return sessions
  } catch (error) {
    throw new Error(error)
  }
}

export const classSessionModel = {
  CLASS_SESSION_COLLECTION_NAME,
  CLASS_SESSION_COLLECTION_SCHEMA,
  createNew,
  addUserToClassSessions,
  getDetailById,
  getList,
  getListWithDetails,
  updateInfo,
  deleteClassSession,
  softDelete,
  getSessionsByClass,
  getSessionsByTrainer,
  getSessionsByRoom,
}
