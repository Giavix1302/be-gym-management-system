import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { BOOKING_STATUS } from '~/utils/constants.js'

const BOOKING_COLLECTION_NAME = 'bookings'
const BOOKING_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  scheduleId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  status: Joi.string()
    .valid(BOOKING_STATUS.BOOKING, BOOKING_STATUS.COMPLETED, BOOKING_STATUS.PENDING, BOOKING_STATUS.CANCELLED)
    .default(BOOKING_STATUS.PENDING),
  price: Joi.number().min(0).required(),
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
  updateInfo,
  deleteBooking,
  softDeleteBooking,
}
