import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { SUBSCRIPTION_STATUS, PAYMENT_STATUS } from '~/utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const SUBSCRIPTION_COLLECTION_NAME = 'subscriptions'
const SUBSCRIPTION_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  membershipId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  status: Joi.string().valid(SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.EXPIRED).required(),
  paymentStatus: Joi.string().valid(PAYMENT_STATUS.PAID, PAYMENT_STATUS.UNPAID),
  remainingSessions: Joi.number().min(0).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await SUBSCRIPTION_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const newSubscriptionToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
      membershipId: new ObjectId(String(validData.membershipId)),
    }
    const createdSubscription = await GET_DB()
      .collection(SUBSCRIPTION_COLLECTION_NAME)
      .insertOne(newSubscriptionToAdd)
    return createdSubscription
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (subId) => {
  try {
    const sub = GET_DB()
      .collection(SUBSCRIPTION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(subId)),
      })
    return sub
  } catch (error) {
    throw new Error(error)
  }
}

export const subscriptionModel = {
  SUBSCRIPTION_COLLECTION_NAME,
  SUBSCRIPTION_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
}
