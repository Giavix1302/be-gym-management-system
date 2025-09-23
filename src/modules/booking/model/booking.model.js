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
  status: Joi.string().valid(
    BOOKING_STATUS.BOOKING,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.PENDING,
    BOOKING_STATUS.CANCELLED
  ),
  price: Joi.number().min(1).required(),
  note: Joi.string().trim().strict(),

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

    const newDataToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
      scheduleId: new ObjectId(String(validData.scheduleId)),
      locationId: new ObjectId(String(validData.locationId)),
    }

    const createdUser = await GET_DB().collection(BOOKING_COLLECTION_NAME).insertOne(newDataToAdd)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(BOOKING_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingModel = {
  BOOKING_COLLECTION_NAME,
  BOOKING_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
