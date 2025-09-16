import { StatusCodes } from 'http-status-codes'
import { checkinService } from '../service/checkin.service'

const createNew = async (req, res, next) => {
  try {
    const result = await checkinService.createNew(req)

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
    const user = await checkinService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const checkinId = req.params.id
    const result = await checkinService.updateInfo(checkinId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteCheckin = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await checkinService.deleteCheckin(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const checkinController = {
  createNew,
  getDetail,
  updateInfo,
  deleteCheckin,
}
