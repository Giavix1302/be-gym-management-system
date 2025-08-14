import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const CART_DETAIL_COLLECTION_NAME = 'cartDetails'
const CART_DETAIL_COLLECTION_SCHEMA = Joi.object({
  cartId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  quantity: Joi.number().min(1).required()
})
const validateBeforeCreate = async (data) => {
  return await CART_DETAIL_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
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
    const createdAccount = await GET_DB().collection(CART_DETAIL_COLLECTION_NAME).insertOne({
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
    const existingUserName = await GET_DB().collection(CART_DETAIL_COLLECTION_NAME).findOne({
      userName: userName
    })
    return existingUserName
  } catch (error) {
    throw new Error(error)
  }
}

export const accountModel = {
  CART_DETAIL_COLLECTION_NAME,
  CART_DETAIL_COLLECTION_SCHEMA,
  createNew,
  getAccountByUserName
}

