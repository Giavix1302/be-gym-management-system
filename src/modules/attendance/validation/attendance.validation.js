import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { ATTENDANCE_METHOD } from '~/utils/constants'

// Validation for unified toggle attendance
const toggle = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    method: Joi.string().valid(ATTENDANCE_METHOD.QRCODE, ATTENDANCE_METHOD.FACE).default(ATTENDANCE_METHOD.QRCODE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

// Legacy validations (kept for backward compatibility)
const checkin = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    method: Joi.string().valid(ATTENDANCE_METHOD.QRCODE, ATTENDANCE_METHOD.FACE).default(ATTENDANCE_METHOD.QRCODE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

const checkout = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

const updateInfo = async (req, res, next) => {
  const correctCondition = Joi.object({
    checkinTime: Joi.string().isoDate().optional(),
    checkoutTime: Joi.string().isoDate().optional(),
    hours: Joi.number().min(0).optional(),
    method: Joi.string().valid(ATTENDANCE_METHOD.QRCODE, ATTENDANCE_METHOD.FACE).optional(),
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

export const attendanceValidation = {
  toggle, // NEW: Unified validation
  checkin, // Legacy
  checkout, // Legacy
  updateInfo,
}
