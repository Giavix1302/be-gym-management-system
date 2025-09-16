import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { EQUIPMENT_STATUS } from '~/utils/constants.js'

const EQUIPMENT_COLLECTION_NAME = 'equipments'
const EQUIPMENT_COLLECTION_SCHEMA = Joi.object({
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().min(2).trim().strict(),
  brand: Joi.string().required().min(1).trim().strict(),
  price: Joi.number().min(1).required(),

  status: Joi.string()
    .valid(EQUIPMENT_STATUS.ACTIVE, EQUIPMENT_STATUS.MAINTENANCE, EQUIPMENT_STATUS.BROKEN)
    .required(),

  purchaseDate: Joi.string().isoDate().allow('').default(''),

  maintenanceHistory: Joi.array()
    .items(
      Joi.object({
        date: Joi.string().isoDate().allow('').default(''), // "2025-02-15"
        details: Joi.string().required(), // "Changed running belt"
        technician: Joi.string().required(), // "John Doe"
      })
    )
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})
const validateBeforeCreate = async (data) => {
  return await EQUIPMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdProduct = await GET_DB().collection(EQUIPMENT_COLLECTION_NAME).insertOne(validData)
    return createdProduct
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (productId) => {
  try {
    const product = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(productId)),
      })
    return product
  } catch (error) {
    throw new Error(error)
  }
}

const getListProduct = async () => {
  try {
    const listProduct = await GET_DB().collection(EQUIPMENT_COLLECTION_NAME).find({}).toArray()
    return listProduct
  } catch (error) {
    throw new Error(error)
  }
}

const updateProduct = async (productId, updateData) => {
  try {
    const updatedProduct = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(productId)) },
        { $set: updateData },
        { returnDocument: 'after' }
      )
    return updatedProduct
  } catch (error) {
    throw new Error(error)
  }
}

const deleteProduct = async (productId) => {
  try {
    const updatedProduct = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(productId)) })
    return updatedProduct.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

export const equipmentModel = {
  EQUIPMENT_COLLECTION_NAME,
  EQUIPMENT_COLLECTION_SCHEMA,
  createNew,
  getDetail,
  getListProduct,
  updateProduct,
  deleteProduct,
}
