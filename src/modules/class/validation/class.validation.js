import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { CLASS_TYPE } from '~/utils/constants.js'

const addClass = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().trim().strict().required().messages({
      'any.required': 'Class name is required',
      'string.empty': 'Class name cannot be empty',
    }),
    description: Joi.string().trim().strict().required().messages({
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be empty',
    }),
    classType: Joi.string().valid(CLASS_TYPE.BOXING, CLASS_TYPE.DANCE, CLASS_TYPE.YOGA).required().messages({
      'any.required': 'Class type is required',
      'any.only': 'Class type must be BOXING, DANCE, or YOGA',
    }),
    capacity: Joi.number().min(1).required().messages({
      'any.required': 'Capacity is required',
      'number.min': 'Capacity must be at least 1',
    }),
    startDate: Joi.string().isoDate().allow('').optional(),
    endDate: Joi.string().isoDate().allow('').optional(),
    trainers: Joi.string().optional(), // Will be parsed as JSON array
    recurrence: Joi.string().optional(), // Will be parsed as JSON array
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })

    // Validate trainers if provided
    if (req.body.trainers) {
      const trainers = JSON.parse(req.body.trainers)
      if (!Array.isArray(trainers)) {
        throw new Error('Trainers must be an array')
      }

      const trainerSchema = Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      await trainerSchema.validateAsync(trainers)
    }

    // Validate recurrence if provided
    if (req.body.recurrence) {
      const recurrence = JSON.parse(req.body.recurrence)
      if (!Array.isArray(recurrence)) {
        throw new Error('Recurrence must be an array')
      }

      const recurrenceSchema = Joi.array().items(
        Joi.object({
          dayOfWeek: Joi.number().integer().min(1).max(7).required().messages({
            'number.min': 'Day of week must be between 1 (Monday) and 7 (Sunday)',
            'number.max': 'Day of week must be between 1 (Monday) and 7 (Sunday)',
          }),
          startTime: Joi.string().isoDate().required(),
          endTime: Joi.string().isoDate().required(),
          roomId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
        })
      )
      await recurrenceSchema.validateAsync(recurrence)
    }

    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

const updateClass = async (req, res, next) => {
  const correctValidation = Joi.object({
    name: Joi.string().trim().strict().optional(),
    description: Joi.string().trim().strict().optional(),
    classType: Joi.string().valid(CLASS_TYPE.BOXING, CLASS_TYPE.DANCE, CLASS_TYPE.YOGA).optional(),
    capacity: Joi.number().min(1).optional(),
    startDate: Joi.string().isoDate().allow('').optional(),
    endDate: Joi.string().isoDate().allow('').optional(),
    trainers: Joi.string().optional(),
    recurrence: Joi.string().optional(),
  })

  try {
    await correctValidation.validateAsync(req.body, { abortEarly: false })

    // Validate trainers if provided
    if (req.body.trainers) {
      const trainers = JSON.parse(req.body.trainers)
      const trainerSchema = Joi.array().items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      await trainerSchema.validateAsync(trainers)
    }

    // Validate recurrence if provided
    if (req.body.recurrence) {
      const recurrence = JSON.parse(req.body.recurrence)
      const recurrenceSchema = Joi.array().items(
        Joi.object({
          dayOfWeek: Joi.number().integer().min(1).max(7).required(),
          startTime: Joi.string().isoDate().required(),
          endTime: Joi.string().isoDate().required(),
          roomId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).optional(),
        })
      )
      await recurrenceSchema.validateAsync(recurrence)
    }

    next()
  } catch (error) {
    const validationError = new Error(error)
    validationError.statusCode = StatusCodes.UNPROCESSABLE_ENTITY
    next(validationError)
  }
}

const getClassesByType = async (req, res, next) => {
  const correctValidation = Joi.object({
    type: Joi.string().valid(CLASS_TYPE.BOXING, CLASS_TYPE.DANCE, CLASS_TYPE.YOGA).required().messages({
      'any.required': 'Class type is required',
      'any.only': 'Class type must be BOXING, DANCE, or YOGA',
    }),
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

export const classValidation = {
  addClass,
  updateClass,
  getClassesByType,
}
