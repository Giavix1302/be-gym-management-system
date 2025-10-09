import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { CLASS_ENROLLMENT_STATUS, PAYMENT_STATUS } from '~/utils/constants.js'

const addClassEnrollment = async (req, res, next) => {
  const correctValidation = Joi.object({
    classId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    enrolledAt: Joi.string().isoDate().allow('').optional(),
    status: Joi.string()
      .valid(
        CLASS_ENROLLMENT_STATUS.PENDING,
        CLASS_ENROLLMENT_STATUS.ACTIVE,
        CLASS_ENROLLMENT_STATUS.COMPLETED,
        CLASS_ENROLLMENT_STATUS.CANCELLED
      )
      .required(),
    paymentStatus: Joi.string().valid(PAYMENT_STATUS.PAID, PAYMENT_STATUS.UNPAID).required(),
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

const updateClassEnrollment = async (req, res, next) => {
  const correctValidation = Joi.object({
    classId: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userId: Joi.string().optional().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    enrolledAt: Joi.string().isoDate().allow('').optional(),
    status: Joi.string()
      .valid(
        CLASS_ENROLLMENT_STATUS.PENDING,
        CLASS_ENROLLMENT_STATUS.ACTIVE,
        CLASS_ENROLLMENT_STATUS.COMPLETED,
        CLASS_ENROLLMENT_STATUS.CANCELLED
      )
      .optional(),
    paymentStatus: Joi.string().valid(PAYMENT_STATUS.PAID, PAYMENT_STATUS.UNPAID).optional(),
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

export const classEnrollmentValidation = {
  addClassEnrollment,
  updateClassEnrollment,
}
