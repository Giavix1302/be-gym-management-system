import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'
import { CHECKIN_METHOD } from '../utils/constants.js'

const CHECKIN_COLLECTION_NAME = 'checkins'
const CHECKIN_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  checkinTime: Joi.date().iso().required(),
  checkoutTime: Joi.date().iso().required(),
  method: Joi.string().valid(CHECKIN_METHOD.CARD, CHECKIN_METHOD.FACE),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await CHECKIN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdUser = await GET_DB().collection(CHECKIN_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(CHECKIN_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const checkinModel = {
  CHECKIN_COLLECTION_NAME,
  CHECKIN_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
