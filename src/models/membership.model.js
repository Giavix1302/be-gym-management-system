import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { MEMBERSHIP_TYPE } from '../utils/constants.js'

const MEMBERSHIP_COLLECTION_NAME = 'memberships'
const MEMBERSHIP_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(2).trim().strict(),
  durationMonth: Joi.number().min(1).max(120),
  price: Joi.number().min(1).required(),
  description: Joi.string().trim().strict(),
  type: Joi.string().valid(MEMBERSHIP_TYPE.GYM, MEMBERSHIP_TYPE.YOGA),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await MEMBERSHIP_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdUser = await GET_DB().collection(MEMBERSHIP_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(MEMBERSHIP_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const membershipModel = {
  MEMBERSHIP_COLLECTION_NAME,
  MEMBERSHIP_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
