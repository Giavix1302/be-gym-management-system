import { StatusCodes } from 'http-status-codes'
import { bookingService } from '../service/booking.service'

const createNew = async (req, res, next) => {
  try {
    const result = await bookingService.createNew(req)

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
    const user = await bookingService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const bookingId = req.params.id
    const result = await bookingService.updateInfo(bookingId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteBooking = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await bookingService.deleteBooking(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const bookingController = {
  createNew,
  getDetail,
  updateInfo,
  deleteBooking,
}
