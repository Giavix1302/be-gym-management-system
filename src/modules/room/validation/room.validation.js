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
    name: Joi.string().min(2).trim().strict(),
    address: Joi.object({
      street: Joi.string(),
      ward: Joi.string(),
      province: Joi.string(),
    }),
    phone: Joi.string()
      .pattern(/^\+[1-9]\d{1,14}$/) // E.164: +[country code][subscriber number]
      .messages({
        'string.pattern.base': 'Phone number must be in E.164 format (e.g., +84901234567).',
      }),
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

export const roomValidation = {
  createNew,
  updateInfo,
}
