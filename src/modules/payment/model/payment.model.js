import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { PAYMENT_METHOD, PAYMENT_TYPE } from '~/utils/constants.js'

const PAYMENT_COLLECTION_NAME = 'payments'
const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  referenceId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  paymentType: Joi.string().valid(PAYMENT_TYPE.MEMBERSHIP, PAYMENT_TYPE.BOOKING),
  amount: Joi.number().min(1).required(),
  paymentDate: Joi.string().isoDate().allow('').default(''),
  paymentMethod: Joi.string().valid(
    PAYMENT_METHOD.CASH,
    PAYMENT_METHOD.BANK,
    PAYMENT_METHOD.MOMO,
    PAYMENT_METHOD.VNPAY
  ),
  description: Joi.string().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await PAYMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const newPaymentToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
      referenceId: new ObjectId(String(validData.referenceId)),
    }
    const createdPayment = await GET_DB().collection(PAYMENT_COLLECTION_NAME).insertOne(newPaymentToAdd)
    return createdPayment
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(PAYMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const paymentModel = {
  PAYMENT_COLLECTION_NAME,
  PAYMENT_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
