import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { MEMBERSHIP_TYPE } from '~/utils/constants.js'
import { subscriptionModel } from '~/modules/subscription/model/subscription.model'

const MEMBERSHIP_COLLECTION_NAME = 'memberships'
const MEMBERSHIP_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(2).trim().strict(),
  durationMonth: Joi.number().min(1).max(120).required(),
  price: Joi.number().min(1).required(),
  discount: Joi.number().min(0).max(100).required(),
  description: Joi.string().trim().strict().required(),
  type: Joi.string().valid(MEMBERSHIP_TYPE.GYM, MEMBERSHIP_TYPE.YOGA, MEMBERSHIP_TYPE.BOXING).required(),
  bannerURL: Joi.string().trim().strict().required(),

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
    const createdMembership = await GET_DB().collection(MEMBERSHIP_COLLECTION_NAME).insertOne(validData)
    return createdMembership
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (membershipId) => {
  try {
    const user = GET_DB()
      .collection(MEMBERSHIP_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(membershipId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const getList = async () => {
  try {
    const listLocation = await GET_DB().collection(MEMBERSHIP_COLLECTION_NAME).find({}).toArray()
    return listLocation
  } catch (error) {
    throw new Error(error)
  }
}

const getListWithQuantityUser = async () => {
  try {
    const db = await GET_DB()
    const listMembership = await db
      .collection(MEMBERSHIP_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: subscriptionModel.SUBSCRIPTION_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'membershipId',
            as: 'subscriptions',
          },
        },
        {
          $addFields: {
            totalUsers: { $size: '$subscriptions' },
          },
        },
        {
          $project: {
            subscriptions: 0, // không cần trả về subscriptions chi tiết
          },
        },
      ])
      .toArray()

    return listMembership
  } catch (error) {
    throw new Error(error)
  }
}

export const membershipModel = {
  MEMBERSHIP_COLLECTION_NAME,
  MEMBERSHIP_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getList,
  getListWithQuantityUser,
}
