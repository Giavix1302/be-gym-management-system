import { StatusCodes } from 'http-status-codes'
import { locationService } from '../service/location.service'

const createNew = async (req, res, next) => {
  try {
    const result = await locationService.createNew(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getListLocation = async (req, res, next) => {
  try {
    const result = await locationService.getListLocation()
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.BAD_REQUEST).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const locationId = req.params.id
    const result = await locationService.updateInfo(locationId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteLocation = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await locationService.deleteLocation(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const locationController = {
  createNew,
  getListLocation,
  updateInfo,
  deleteLocation,
}
