import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { APPROVED_TYPE, SPECIALIZATION_TYPE } from '~/utils/constants'

const TRAINER_COLLECTION_NAME = 'trainers'
const TRAINER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  specialization: Joi.string()
    .valid(
      SPECIALIZATION_TYPE.GYM,
      SPECIALIZATION_TYPE.BOXING,
      SPECIALIZATION_TYPE.YOGA,
      SPECIALIZATION_TYPE.DANCE
    )
    .default(''),
  bio: Joi.string().required().trim().strict(),

  physiqueImages: Joi.array().items(Joi.string().trim().strict()).required(),

  isApproved: Joi.string()
    .valid(APPROVED_TYPE.APPROVED, APPROVED_TYPE.PENDING, APPROVED_TYPE.REJECTED)
    .default(APPROVED_TYPE.PENDING),

  approvedAt: Joi.string().isoDate().allow('').default(''),

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
    const newTrainerToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
    }
    const created = await GET_DB().collection(TRAINER_COLLECTION_NAME).insertOne(newTrainerToAdd)
    return created
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailByUserId = async (userId) => {
  try {
    const result = GET_DB()
      .collection(TRAINER_COLLECTION_NAME)
      .findOne({
        userId: new ObjectId(String(userId)),
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (id) => {
  try {
    const result = GET_DB()
      .collection(TRAINER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id)),
      })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (trainerId, updateData) => {
  try {
    const updated = await GET_DB()
      .collection(TRAINER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(trainerId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

export const trainerModel = {
  TRAINER_COLLECTION_NAME,
  TRAINER_COLLECTION_SCHEMA,
  createNew,
  getDetailByUserId,
  getDetailById,
  updateInfo,
}
