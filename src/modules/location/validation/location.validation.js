import Joi from 'joi'
import { GENDER_TYPE, STATUS_TYPE, USER_TYPES } from '~/utils/constants.js'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().required().min(2).trim().strict(),
    address: Joi.object({
      street: Joi.string().required(),
      ward: Joi.string().required(),
      province: Joi.string().required(),
    }),
    phone: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/) // E.164: +[country code][subscriber number]
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +84901234567).',
      })
      .required(),
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

const updateInfo = async (req, res, next) => {
  const correctValidation = Joi.object({
    fullName: Joi.string().min(2).trim().strict(),
    email: Joi.string().email().trim().strict(),
    age: Joi.number().min(1).max(120),
    dateOfBirth: Joi.date().iso(), // 13/02/2004
    address: Joi.string().trim().strict(),
    gender: Joi.string().valid(GENDER_TYPE.MALE, GENDER_TYPE.FEMALE, GENDER_TYPE.OTHER),
    role: Joi.string().valid(USER_TYPES.USER, USER_TYPES.PT),
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

export const locationValidation = {
  createNew,
  updateInfo,
}
