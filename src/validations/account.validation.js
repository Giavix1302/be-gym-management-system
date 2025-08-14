import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { USER_TYPES } from '../utils/constants.js'

const login = async (req, res, next) => {
  const correctValidation = Joi.object({
    userName: Joi.string().min(4).required().trim().strict(),
    password: Joi.string().required().trim().strict(),
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

const signup = async (req, res, next) => {
  const correctValidation = Joi.object({
    userName: Joi.string().min(4).required().trim().strict(),
    password: Joi.string().required().trim().strict(),
    name: Joi.string().required().min(2).trim().strict(),
    email: Joi.string().email().required().trim().strict(),
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

export const accountValidation = {
  login,
  signup
}