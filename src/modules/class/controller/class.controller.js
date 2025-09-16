import { StatusCodes } from 'http-status-codes'
import { classService } from '../service/class.service'

const createNew = async (req, res, next) => {
  try {
    const result = await classService.createNew(req)

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
    const user = await classService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const classId = req.params.id
    const result = await classService.updateInfo(classId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteClass = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await classService.deleteClass(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const classController = {
  createNew,
  getDetail,
  updateInfo,
  deleteClass,
}
