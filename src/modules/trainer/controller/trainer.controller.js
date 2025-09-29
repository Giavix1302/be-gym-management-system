import { StatusCodes } from 'http-status-codes'
import { trainerService } from '../service/trainer.service'

const createNew = async (req, res, next) => {
  try {
    const result = await trainerService.createNew(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getDetailByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await trainerService.getDetailByUserId(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getListTrainerForUser = async (req, res, next) => {
  try {
    const result = await trainerService.getListTrainerForUser()
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await trainerService.updateInfo(userId, req)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const trainerController = {
  createNew,
  getDetailByUserId,
  getListTrainerForUser,
  updateInfo,
}
