import { StatusCodes } from 'http-status-codes'
import { classSessionService } from '../service/classSession.service'

const addClassSession = async (req, res, next) => {
  try {
    const result = await classSessionService.addClassSession(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getListClassSession = async (req, res, next) => {
  try {
    const result = await classSessionService.getListClassSession()

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const updateClassSession = async (req, res, next) => {
  try {
    const result = await classSessionService.updateClassSession(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteClassSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id

    const result = await classSessionService.deleteClassSession(sessionId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const classSessionController = {
  addClassSession,
  updateClassSession,
  deleteClassSession,
  getListClassSession,
}
