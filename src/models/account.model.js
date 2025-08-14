import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const ACCOUNT_COLLECTION_NAME = 'accounts'
const ACCOUNT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userName: Joi.string().min(4).required().trim().strict(),
  password: Joi.string().required().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
  return await ACCOUNT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const { hashedPassword: password, ...rest } = data
    const transformData = {
      ...rest,
      userId: data.userId.toString(),
      password
    }
    const validData = await validateBeforeCreate(transformData, { abortEarly: false })
    const createdAccount = await GET_DB().collection(ACCOUNT_COLLECTION_NAME).insertOne({
      ...validData,
      userId: new ObjectId(String(validData.userId))
    })
    return createdAccount
  } catch (error) {
    throw new Error(error)
  }
}

const getAccountByUserName = async (userName) => {
  try {
    const existingUserName = await GET_DB().collection(ACCOUNT_COLLECTION_NAME).findOne({
      userName: userName
    })
    return existingUserName
  } catch (error) {
    throw new Error(error)
  }
}

export const accountModel = {
  ACCOUNT_COLLECTION_NAME,
  ACCOUNT_COLLECTION_SCHEMA,
  createNew,
  getAccountByUserName
}

