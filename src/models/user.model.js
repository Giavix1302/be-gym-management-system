import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { USER_TYPES, GENDER_TYPE, STATUS_TYPE } from '../utils/constants.js'

const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  fullName: Joi.string().required().min(2).trim().strict(),
  email: Joi.string().email().trim().strict(),
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/) // E.164: +[country code][subscriber number]
    .messages({
      'string.pattern.base': 'Phone number must be in E.164 format (e.g., +84901234567).',
    })
    .required(),
  avatar: Joi.string().trim().strict(),
  password: Joi.string().required().trim().strict(),
  age: Joi.number().min(1).max(120),
  dateOfBirth: Joi.date().iso().required(), // 13/02/2004
  address: Joi.string().trim().strict(),
  gender: Joi.string().valid(GENDER_TYPE.MALE, GENDER_TYPE.FEMALE, GENDER_TYPE.OTHER).required(),

  role: Joi.string().valid(USER_TYPES.USER, USER_TYPES.ADMIN, USER_TYPES.PT).required(),

  status: Joi.string().valid(STATUS_TYPE.ACTIVE, STATUS_TYPE.INACTIVE).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
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

const getDetailById = async (userId) => {
  try {
    const user = GET_DB()
      .collection(USER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailByPhone = async (phone) => {
  try {
    const user = GET_DB().collection(USER_COLLECTION_NAME).findOne({
      phone: phone,
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
  getDetailById,
  getDetailByPhone,
}
