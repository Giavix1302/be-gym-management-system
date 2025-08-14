import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '../config/mongodb.config.js'

const PRODUCT_COLLECTION_NAME = 'products'
const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  productName: Joi.string().required().min(2).trim().strict(),
  price: Joi.number().min(1).required(),
  imgUrl: Joi.string().required().trim().strict(),
  description: Joi.string().required().trim().strict(),
  category: Joi.string().required().trim().strict(),
  color: Joi.array().items(
    Joi.string().trim().strict(),
  ).default([]),
  quantity: Joi.number().min(1).required(),
  supplier: Joi.string().trim().strict(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })
    const createdProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(validData)
    return createdProduct
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (productId) => {
  try {
    const product = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: new ObjectId(String(productId))
    })
    return product
  } catch (error) {
    throw new Error(error)
  }
}

const getListProduct = async () => {
  try {
    const listProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).find({}).toArray()
    return listProduct
  } catch (error) {
    throw new Error(error)
  }
}

const updateProduct = async (productId, updateData) => {
  try {
    const updatedProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
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
    const updatedProduct = await GET_DB().collection(PRODUCT_COLLECTION_NAME).deleteOne(
      { _id: new ObjectId(String(productId)) }
    )
    return updatedProduct.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

export const productModel = {
  PRODUCT_COLLECTION_NAME,
  PRODUCT_COLLECTION_SCHEMA,
  createNew,
  getDetail,
  getListProduct,
  updateProduct,
  deleteProduct
}

