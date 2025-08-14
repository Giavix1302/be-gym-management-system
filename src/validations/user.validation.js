import Joi from 'joi'
import { USER_TYPES } from '../utils/constants.js'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(2).trim().strict(),
    age: Joi.number().min(1).max(120),
    email: Joi.string().email().required().trim().strict(),
    avatar: Joi.string().trim().strict(),
    address: Joi.string().trim().strict(),
    phone: Joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': 'Phone number must have 10 digits.' }).required(),
    role: Joi.string().valid(USER_TYPES.USER, USER_TYPES.ADMIN).required()
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

export const userValidation = {
  createNew
}