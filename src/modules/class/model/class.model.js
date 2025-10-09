import { ObjectId } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { CLASS_TYPE } from '~/utils/constants'
import { trainerModel } from '~/modules/trainer/model/trainer.model'
import { roomModel } from '~/modules/room/model/room.model'
import { userModel } from '~/modules/user/model/user.model'
import { reviewModel } from '~/modules/review/model/review.model'
import { classSessionModel } from '~/modules/classSession/model/classSession.model'
import { classEnrollmentModel } from '~/modules/classEnrollment/model/classEnrollment.model'
import { locationModel } from '~/modules/location/model/location.model'

const CLASS_COLLECTION_NAME = 'classes'
const CLASS_COLLECTION_SCHEMA = Joi.object({
  locationId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  name: Joi.string().trim().strict().required(),
  description: Joi.string().trim().strict().required(),
  classType: Joi.string().valid(CLASS_TYPE.BOXING, CLASS_TYPE.DANCE, CLASS_TYPE.YOGA).required(),
  image: Joi.string().trim().strict().default(''),
  trainers: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  capacity: Joi.number().min(1).required(),
  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  price: Joi.number().min(1).required(),

  recurrence: Joi.array()
    .items(
      Joi.object({
        dayOfWeek: Joi.number().integer().min(1).max(7).required(),
        startTime: Joi.object({
          hour: Joi.number().min(0).max(24),
          minute: Joi.number().min(0).max(60),
        }),
        endTime: Joi.object({
          hour: Joi.number().min(0).max(24),
          minute: Joi.number().min(0).max(60),
        }),
        roomId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
      })
    )
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await CLASS_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    if (validData.locationId) {
      validData.locationId = new ObjectId(String(validData.locationId))
    }

    // Convert trainer IDs to ObjectId if they're strings
    if (validData.trainers && validData.trainers.length > 0) {
      validData.trainers = validData.trainers.map((id) => new ObjectId(String(id)))
    }

    // Convert room IDs in recurrence to ObjectId
    if (validData.recurrence && validData.recurrence.length > 0) {
      validData.recurrence = validData.recurrence.map((rec) => ({
        ...rec,
        roomId: rec.roomId ? new ObjectId(String(rec.roomId)) : null,
      }))
    }

    const createdClass = await GET_DB().collection(CLASS_COLLECTION_NAME).insertOne(validData)
    return createdClass
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (classId) => {
  try {
    const classDoc = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(classId)),
      })
    return classDoc
  } catch (error) {
    throw new Error(error)
  }
}

const getList = async () => {
  try {
    const listClasses = await GET_DB().collection(CLASS_COLLECTION_NAME).find({ _destroy: false }).toArray()
    return listClasses
  } catch (error) {
    throw new Error(error)
  }
}

const getListClassInfoForAdmin = async () => {
  try {
    const db = await GET_DB()
    const listClasses = await db
      .collection(CLASS_COLLECTION_NAME)
      .aggregate([
        {
          $match: { _destroy: false },
        },
        // Lookup Location
        {
          $lookup: {
            from: locationModel.LOCATION_COLLECTION_NAME,
            localField: 'locationId',
            foreignField: '_id',
            as: 'locationDetails',
          },
        },
        // Lookup ClassEnrollments
        {
          $lookup: {
            from: 'class_enrollments',
            localField: '_id',
            foreignField: 'classId',
            as: 'enrollments',
          },
        },
        // Lookup ClassSessions
        {
          $lookup: {
            from: 'class_sessions',
            localField: '_id',
            foreignField: 'classId',
            as: 'sessions',
          },
        },
        // Add fields for counts and revenue
        {
          $addFields: {
            enrolledCount: { $size: '$enrollments' },
            sessionsCount: { $size: '$sessions' },
            revenue: {
              $sum: '$enrollments.price',
            },
            locationInfo: { $arrayElemAt: ['$locationDetails', 0] },
          },
        },
        // Unwind enrollments to lookup user details
        {
          $lookup: {
            from: 'users',
            localField: 'enrollments.userId',
            foreignField: '_id',
            as: 'enrollmentUsers',
          },
        },
        // Process enrollments with user details
        {
          $addFields: {
            classEnrollments: {
              $map: {
                input: '$enrollments',
                as: 'enrollment',
                in: {
                  $let: {
                    vars: {
                      user: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$enrollmentUsers',
                              as: 'u',
                              cond: { $eq: ['$$u._id', '$$enrollment.userId'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: '$$enrollment._id',
                      fullName: { $ifNull: ['$$user.fullName', ''] },
                      phone: { $ifNull: ['$$user.phone', ''] },
                      avatar: { $ifNull: ['$$user.avatar', ''] },
                      createAt: { $ifNull: ['$$enrollment.enrolledAt', ''] },
                    },
                  },
                },
              },
            },
          },
        },
        // Process sessions
        {
          $addFields: {
            classSessions: {
              $map: {
                input: '$sessions',
                as: 'session',
                in: {
                  _id: '$$session._id',
                  classId: '$$session.classId',
                  className: '$name',
                  startTime: { $ifNull: ['$$session.startTime', ''] },
                  endTime: { $ifNull: ['$$session.endTime', ''] },
                  roomId: { $ifNull: ['$$session.roomId', ''] },
                  trainers: { $ifNull: ['$$session.trainers', []] },
                  title: { $ifNull: ['$$session.title', 'Lớp học'] },
                },
              },
            },
          },
        },
        // Project final structure
        {
          $project: {
            _id: 1,
            name: 1,
            price: 1,
            description: 1,
            classType: 1,
            image: { $ifNull: ['$image', ''] },
            trainers: 1,
            capacity: 1,
            startDate: 1,
            endDate: 1,
            recurrence: 1,
            enrolledCount: 1,
            sessionsCount: 1,
            revenue: 1,
            classSessions: 1,
            classEnrollments: 1,
            locationName: { $ifNull: ['$locationInfo.name', ''] },
            locationAddress: {
              street: { $ifNull: ['$locationInfo.address.street', ''] },
              ward: { $ifNull: ['$locationInfo.address.ward', ''] },
              province: { $ifNull: ['$locationInfo.address.province', ''] },
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return listClasses
  } catch (error) {
    throw new Error(error)
  }
}

const getListClassInfoForUser = async () => {
  try {
    const db = await GET_DB()
    const listClasses = await db
      .collection(CLASS_COLLECTION_NAME)
      .aggregate([
        {
          $match: { _destroy: false },
        },
        // Lookup location details
        {
          $lookup: {
            from: locationModel.LOCATION_COLLECTION_NAME,
            localField: 'locationId',
            foreignField: '_id',
            as: 'locationDetails',
          },
        },
        // Lookup trainer details
        {
          $lookup: {
            from: trainerModel.TRAINER_COLLECTION_NAME,
            localField: 'trainers',
            foreignField: '_id',
            as: 'trainerDetails',
          },
        },
        // Lookup class enrollments to count enrolled users
        {
          $lookup: {
            from: classEnrollmentModel.CLASS_ENROLLMENT_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'classId',
            as: 'enrollments',
          },
        },
        // Lookup class sessions
        {
          $lookup: {
            from: classSessionModel.CLASS_SESSION_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'classId',
            as: 'sessions',
          },
        },
        // Lookup rooms for class sessions
        {
          $lookup: {
            from: roomModel.ROOM_COLLECTION_NAME,
            localField: 'sessions.roomId',
            foreignField: '_id',
            as: 'roomDetails',
          },
        },
        // Lookup reviews for trainers to get ratings
        {
          $lookup: {
            from: reviewModel.REVIEW_COLLECTION_NAME,
            localField: 'trainers',
            foreignField: 'trainerId',
            as: 'trainerReviews',
          },
        },
        // Process the data
        {
          $addFields: {
            locationInfo: { $arrayElemAt: ['$locationDetails', 0] },
            enrolled: {
              $size: {
                $filter: {
                  input: '$enrollments',
                  cond: { $eq: ['$$this._destroy', false] },
                },
              },
            },
            // Process trainers with their ratings
            trainersWithRatings: {
              $map: {
                input: '$trainerDetails',
                as: 'trainer',
                in: {
                  $let: {
                    vars: {
                      trainerReviews: {
                        $filter: {
                          input: '$trainerReviews',
                          cond: {
                            $and: [
                              { $eq: ['$$this.trainerId', '$$trainer._id'] },
                              { $eq: ['$$this._destroy', false] },
                            ],
                          },
                        },
                      },
                      // Join with users collection through a subquery
                      userInfo: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: { $literal: [] }, // Will be populated in next lookup
                              cond: { $eq: ['$$this._id', '$$trainer.userId'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: '$$trainer._id',
                      userId: '$$trainer.userId',
                      name: '',
                      avatar: '',
                      phone: '',
                      specialization: '$$trainer.specialization',
                      rating: {
                        $cond: {
                          if: { $gt: [{ $size: '$$trainerReviews' }, 0] },
                          then: {
                            $round: [
                              {
                                $avg: {
                                  $map: {
                                    input: '$$trainerReviews',
                                    as: 'review',
                                    in: '$$review.rating',
                                  },
                                },
                              },
                              0,
                            ],
                          },
                          else: 0,
                        },
                      },
                    },
                  },
                },
              },
            },
            // Process class sessions with room info
            processedSessions: {
              $map: {
                input: {
                  $filter: {
                    input: '$sessions',
                    cond: { $eq: ['$$this._destroy', false] },
                  },
                },
                as: 'session',
                in: {
                  $let: {
                    vars: {
                      roomInfo: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$roomDetails',
                              cond: { $eq: ['$$this._id', '$$session.roomId'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: '$$session._id',
                      title: '$$session.title',
                      startTime: '$$session.startTime',
                      endTime: '$$session.endTime',
                      room: { $ifNull: ['$$roomInfo.name', ''] },
                    },
                  },
                },
              },
            },
          },
        },
        // Lookup user details for trainers
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'trainersWithRatings.userId',
            foreignField: '_id',
            as: 'trainerUsers',
          },
        },
        // Final processing to combine trainer info with user details
        {
          $addFields: {
            trainers: {
              $map: {
                input: '$trainersWithRatings',
                as: 'trainer',
                in: {
                  $let: {
                    vars: {
                      userDetail: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$trainerUsers',
                              cond: { $eq: ['$$this._id', '$$trainer.userId'] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: {
                      _id: '$$trainer._id',
                      name: { $ifNull: ['$$userDetail.fullName', ''] },
                      avatar: { $ifNull: ['$$userDetail.avatar', ''] },
                      phone: { $ifNull: ['$$userDetail.phone', ''] },
                      specialization: '$$trainer.specialization',
                      rating: '$$trainer.rating',
                    },
                  },
                },
              },
            },
          },
        },
        // Project final structure
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            classType: 1,
            image: { $ifNull: ['$image', ''] },
            capacity: 1,
            enrolled: 1,
            startDate: 1,
            endDate: 1,
            price: 1,
            locationName: { $ifNull: ['$locationInfo.name', ''] },
            address: {
              street: { $ifNull: ['$locationInfo.address.street', ''] },
              ward: { $ifNull: ['$locationInfo.address.ward', ''] },
              province: { $ifNull: ['$locationInfo.address.province', ''] },
            },
            trainers: 1,
            recurrence: 1,
            classSession: '$processedSessions',
          },
        },
        // Sort by start date (most recent first)
        {
          $sort: { startDate: -1 },
        },
      ])
      .toArray()

    return listClasses
  } catch (error) {
    throw new Error(error)
  }
}

const getListWithDetails = async () => {
  try {
    const db = await GET_DB()
    const listClasses = await db
      .collection(CLASS_COLLECTION_NAME)
      .aggregate([
        {
          $match: { _destroy: false },
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
          $addFields: {
            totalTrainers: { $size: '$trainerDetails' },
            totalSessions: { $size: '$recurrence' },
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            classType: 1,
            image: 1,
            capacity: 1,
            startDate: 1,
            endDate: 1,
            totalTrainers: 1,
            totalSessions: 1,
            'trainerDetails._id': 1,
            'trainerDetails.name': 1,
            'trainerDetails.avatar': 1,
            recurrence: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return listClasses
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (classId, updateData) => {
  try {
    // Convert trainer IDs to ObjectId if present
    if (updateData.trainers && updateData.trainers.length > 0) {
      updateData.trainers = updateData.trainers.map((id) => new ObjectId(String(id)))
    }

    // Convert room IDs in recurrence to ObjectId if present
    if (updateData.recurrence && updateData.recurrence.length > 0) {
      updateData.recurrence = updateData.recurrence.map((rec) => ({
        ...rec,
        roomId: rec.roomId ? new ObjectId(String(rec.roomId)) : null,
      }))
    }

    const updatedClass = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(classId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updatedClass
  } catch (error) {
    throw new Error(error)
  }
}

const deleteClass = async (classId) => {
  try {
    const result = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(classId)) })
    return result.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

const softDelete = async (classId) => {
  try {
    const result = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(classId)) },
        { $set: { _destroy: true, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getClassesByTrainer = async (trainerId) => {
  try {
    const classes = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .find({
        trainers: new ObjectId(String(trainerId)),
        _destroy: false,
      })
      .toArray()
    return classes
  } catch (error) {
    throw new Error(error)
  }
}

const getClassesByType = async (classType) => {
  try {
    const classes = await GET_DB()
      .collection(CLASS_COLLECTION_NAME)
      .find({
        classType: classType,
        _destroy: false,
      })
      .toArray()
    return classes
  } catch (error) {
    throw new Error(error)
  }
}

export const classModel = {
  CLASS_COLLECTION_NAME,
  CLASS_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getList,
  getListWithDetails,
  updateInfo,
  deleteClass,
  softDelete,
  getClassesByTrainer,
  getClassesByType,
  getListClassInfoForAdmin,
  getListClassInfoForUser,
}
