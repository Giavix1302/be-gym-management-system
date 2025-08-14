import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { USER_TYPES } from '../utils/constants.js'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(2).trim().strict(),
  age: Joi.number().min(1).max(120),
  email: Joi.string().email().required().trim().strict(),
  avatar: Joi.string().trim().strict(),
  address: Joi.string().trim().strict(),
  phone: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': 'Phone number must have 10 digits.' }).required(),
  role: Joi.string().valid(USER_TYPES.USER, USER_TYPES.ADMIN).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(userId))
    })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  getDetail
}

