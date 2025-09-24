import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { BOOKING_STATUS } from '~/utils/constants.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'

const createBooking = async (req, res, next) => {
  const correctValidation = Joi.object({
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    scheduleId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    price: Joi.number().min(0).required(),
    note: Joi.string().trim().strict().allow('').optional(),
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

const updateBooking = async (req, res, next) => {
  const correctValidation = Joi.object({
    status: Joi.string()
      .valid(
        BOOKING_STATUS.BOOKING,
        BOOKING_STATUS.COMPLETED,
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.CANCELLED
      )
      .optional(),
    price: Joi.number().min(0).optional(),
    note: Joi.string().trim().strict().allow('').optional(),
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

const validateBookingId = async (req, res, next) => {
  const correctValidation = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  })

  try {
    await correctValidation.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

export const bookingValidation = {
  createBooking,
  updateBooking,
  validateBookingId,
}
