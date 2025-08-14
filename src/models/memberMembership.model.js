import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'
import { MEMBER_MEMBERSHIP_STATUS } from '../utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

const MEMBER_MEMBERSHIP_COLLECTION_NAME = 'memberMemberships'
const MEMBER_MEMBERSHIP_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  membershipId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  status: Joi.string().valid(MEMBER_MEMBERSHIP_STATUS.ACTIVE, MEMBER_MEMBERSHIP_STATUS.EXPIRED),
  remainingSessions: Joi.number().min(1).required(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await MEMBER_MEMBERSHIP_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdUser = await GET_DB().collection(MEMBER_MEMBERSHIP_COLLECTION_NAME).insertOne(validData)
    return createdUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = GET_DB()
      .collection(MEMBER_MEMBERSHIP_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(userId)),
      })
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const memberMembershipModel = {
  MEMBER_MEMBERSHIP_COLLECTION_NAME,
  MEMBER_MEMBERSHIP_COLLECTION_SCHEMA,
  createNew,
  getDetail,
}
