import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { ATTENDANCE_METHOD } from '~/utils/constants.js'

const ATTENDANCE_COLLECTION_NAME = 'attendances'
const ATTENDANCE_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  checkinTime: Joi.string().isoDate().allow('').default(''),
  checkoutTime: Joi.string().isoDate().allow('').default(''),
  hours: Joi.number().default(0),
  method: Joi.string().valid(ATTENDANCE_METHOD.QRCODE, ATTENDANCE_METHOD.FACE).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await ATTENDANCE_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })

    if (validData.userId) {
      validData.userId = new ObjectId(String(validData.userId))
    }

    if (validData.locationId) {
      validData.locationId = new ObjectId(String(validData.locationId))
    }

    const createdAttendance = await GET_DB().collection(ATTENDANCE_COLLECTION_NAME).insertOne(validData)
    return createdAttendance
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (attendanceId) => {
  try {
    const attendance = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(attendanceId)),
      })
    return attendance
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (attendanceId) => {
  try {
    const attendance = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(attendanceId)),
      })
    return attendance
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy attendance đang active của user (chưa checkout)
const getActiveAttendanceByUser = async (userId) => {
  try {
    const attendance = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOne({
        userId: new ObjectId(String(userId)),
        checkoutTime: '',
        _destroy: false,
      })
    return attendance
  } catch (error) {
    throw new Error(error)
  }
}

// NEW: Lấy attendance đang active của user trong khoảng thời gian (hôm nay)
const getActiveAttendanceByUserToday = async (userId, startDate, endDate) => {
  try {
    const attendance = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOne({
        userId: new ObjectId(String(userId)),
        checkoutTime: '', // Chưa checkout
        _destroy: false,
        checkinTime: {
          $gte: startDate,
          $lt: endDate,
        },
      })
    return attendance
  } catch (error) {
    throw new Error(error)
  }
}

// Atomic operation để checkout - findOneAndUpdate
const findOneAndUpdateActiveAttendance = async (userId, updateData) => {
  try {
    const result = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOneAndUpdate(
        {
          userId: new ObjectId(String(userId)),
          checkoutTime: '',
          _destroy: false,
        },
        {
          $set: updateData,
        },
        {
          returnDocument: 'after',
        }
      )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getUserAttendances = async (userId, startDate, endDate) => {
  try {
    const query = {
      userId: new ObjectId(String(userId)),
      _destroy: false,
    }

    if (startDate && endDate) {
      query.checkinTime = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    const attendances = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .find(query)
      .sort({ checkinTime: -1 })
      .toArray()
    return attendances
  } catch (error) {
    throw new Error(error)
  }
}

const getAttendancesByLocation = async (locationId, startDate, endDate) => {
  try {
    const query = {
      locationId: new ObjectId(String(locationId)),
      _destroy: false,
    }

    if (startDate && endDate) {
      query.checkinTime = {
        $gte: startDate,
        $lte: endDate,
      }
    }

    const attendances = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .find(query)
      .sort({ checkinTime: -1 })
      .toArray()
    return attendances
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (attendanceId, updateData) => {
  try {
    const updatedAttendance = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(String(attendanceId)) }, { $set: updateData }, { returnDocument: 'after' })
    return updatedAttendance
  } catch (error) {
    throw new Error(error)
  }
}

const deleteAttendance = async (attendanceId) => {
  try {
    const result = await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(String(attendanceId)) }, { $set: { _destroy: true, updatedAt: Date.now() } })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// Method để tạo unique index (chạy 1 lần duy nhất)
const createUniqueIndex = async () => {
  try {
    await GET_DB()
      .collection(ATTENDANCE_COLLECTION_NAME)
      .createIndex(
        {
          userId: 1,
          checkoutTime: 1,
        },
        {
          name: 'unique_active_attendance',
          unique: true,
          partialFilterExpression: {
            checkoutTime: '',
            _destroy: false,
          },
        }
      )
    console.log('✅ Unique index created successfully')
  } catch (error) {
    if (error.code === 85) {
      console.log('⚠️ Index already exists')
    } else {
      console.error('❌ Error creating index:', error)
    }
  }
}

export const attendanceModel = {
  ATTENDANCE_COLLECTION_NAME,
  ATTENDANCE_COLLECTION_SCHEMA,
  createNew,
  getDetail,
  getDetailById,
  getActiveAttendanceByUser,
  getActiveAttendanceByUserToday, // NEW: For unified toggle function
  findOneAndUpdateActiveAttendance,
  getUserAttendances,
  getAttendancesByLocation,
  updateInfo,
  deleteAttendance,
  createUniqueIndex,
}
