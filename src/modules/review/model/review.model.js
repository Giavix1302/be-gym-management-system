import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const REVIEW_COLLECTION_NAME = 'reviews'
const REVIEW_COLLECTION_SCHEMA = Joi.object({
  bookingId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  trainerId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})
const validateBeforeCreate = async (data) => {
  return await REVIEW_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })

    const newDataToAdd = {
      ...validData,
      userId: new ObjectId(String(validData.userId)),
      bookingId: new ObjectId(String(validData.bookingId)),
      trainerId: new ObjectId(String(validData.trainerId)),
    }

    const createdReview = await GET_DB().collection(REVIEW_COLLECTION_NAME).insertOne(newDataToAdd)
    return createdReview
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (reviewId) => {
  try {
    const review = await GET_DB()
      .collection(REVIEW_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(reviewId)),
      })
    return review
  } catch (error) {
    throw new Error(error)
  }
}

const getListReview = async () => {
  try {
    const listReview = await GET_DB().collection(REVIEW_COLLECTION_NAME).find({}).toArray()
    return listReview
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (reviewId, updateData) => {
  try {
    const updatedReview = await GET_DB()
      .collection(REVIEW_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(reviewId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updatedReview
  } catch (error) {
    throw new Error(error)
  }
}

const deleteReview = async (reviewId) => {
  try {
    const review = await GET_DB()
      .collection(REVIEW_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(reviewId)) })
    return review.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

export const reviewModel = {
  REVIEW_COLLECTION_NAME,
  REVIEW_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getListReview,
  updateInfo,
  deleteReview,
}
