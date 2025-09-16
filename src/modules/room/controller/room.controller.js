import { StatusCodes } from 'http-status-codes'
import { roomService } from '../service/room.service'

const createNew = async (req, res, next) => {
  try {
    const result = await roomService.createNew(req)

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
    const user = await roomService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const roomId = req.params.id
    const result = await roomService.updateInfo(roomId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteRoom = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await roomService.deleteroom(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const roomController = {
  createNew,
  getDetail,
  updateInfo,
  deleteRoom,
}
