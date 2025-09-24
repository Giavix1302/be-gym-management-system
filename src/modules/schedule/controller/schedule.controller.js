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

const getListScheduleByTrainerId = async (req, res, next) => {
  try {
    const trainerId = req.params.id
    const result = await scheduleService.getListScheduleByTrainerId(trainerId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
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
    const scheduleId = req.params.id
    const result = await scheduleService.deleteSchedule(scheduleId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteListSchedule = async (req, res, next) => {
  try {
    const result = await scheduleService.deleteListSchedule(req.body)
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
  getListScheduleByTrainerId,
  updateInfo,
  deleteSchedule,
  deleteListSchedule,
}
