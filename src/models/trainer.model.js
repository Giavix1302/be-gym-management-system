import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const TRAINER_COLLECTION_NAME = 'trainers'
const TRAINER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  specialization: Joi.string().required().trim().strict(),
  bio: Joi.string().required().trim().strict(),

  physiqueImages: Joi.array().items(Joi.string().trim().strict()).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})
const validateBeforeCreate = async (data) => {
  return await TRAINER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdUser = await GET_DB().collection(TRAINER_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(TRAINER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const trainerModel = {
  TRAINER_COLLECTION_NAME,
  TRAINER_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
