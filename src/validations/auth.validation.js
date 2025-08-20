import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { USER_TYPES, GENDER_TYPE, STATUS_TYPE } from '../utils/constants.js'

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

// usable
const signup = async (req, res, next) => {
  const correctValidation = Joi.object({
    fullName: Joi.string().required().min(2).trim().strict(),
    phone: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/) // E.164: +[country code][subscriber number]
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +84901234567).',
      })
      .required(),
    password: Joi.string().required().trim().strict(),
    dateOfBirth: Joi.date().iso().required(),
    gender: Joi.string().valid(GENDER_TYPE.MALE, GENDER_TYPE.FEMALE, GENDER_TYPE.OTHER).required(),
    role: Joi.string().valid(USER_TYPES.USER, USER_TYPES.ADMIN, USER_TYPES.PT).required(),
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

export const authValidation = {
  login,
  signup,
}
