import { StatusCodes } from 'http-status-codes'
import { scheduleService } from '../service/schedule.service'

const createNew = async (req, res, next) => {
  try {
    const result = await scheduleService.createNew(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getDetail = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await scheduleService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const scheduleId = req.params.id
    const result = await scheduleService.updateInfo(scheduleId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteSchedule = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await scheduleService.deleteSchedule(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const scheduleController = {
  createNew,
  getDetail,
  updateInfo,
  deleteSchedule,
}
