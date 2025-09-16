import { StatusCodes } from 'http-status-codes'
import { equipmentService } from '../service/equipment.service'

const createNew = async (req, res, next) => {
  try {
    const result = await equipmentService.createNew(req)

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
    const user = await equipmentService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) {
    next(error)
  }
}

const updateInfo = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.updateInfo(equipmentId, req.body)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteEquipment = async (req, res, next) => {
  try {
    const userId = req.params.id
    const result = await equipmentService.deleteEquipment(userId)
    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const equipmentController = {
  createNew,
  getDetail,
  updateInfo,
  deleteEquipment,
}
