import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { USER_TYPES } from '../utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '../utils/validators.js'

/**
 * cartId
 * productId
 * quantity
 * 
 */
const addToCart = async (req, res, next) => {
  const correctValidation = Joi.object({
    cartId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    productId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    quantity: Joi.number().min(1).required()
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

/**
 * cartDetailId
 * quantity
 */
const updateQuantity = async (req, res, next) => {
  const correctValidation = Joi.object({
    cartDetailId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    quantity: Joi.number().min(1).required()
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

export const cartValidation = {
  addToCart,
  updateQuantity
}