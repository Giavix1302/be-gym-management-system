import { StatusCodes } from 'http-status-codes'
import { equipmentService } from '../service/equipment.service'

const createEquipment = async (req, res, next) => {
  try {
    const result = await equipmentService.createEquipment(req.body)

    if (result.success) {
      res.status(StatusCodes.CREATED).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getEquipmentById = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.getEquipmentById(equipmentId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getEquipmentsByLocationId = async (req, res, next) => {
  try {
    const locationId = req.params.locationId
    const result = await equipmentService.getEquipmentsByLocationId(locationId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.NOT_FOUND).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getAllEquipments = async (req, res, next) => {
  try {
    const result = await equipmentService.getAllEquipments()

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getEquipmentsByStatus = async (req, res, next) => {
  try {
    const status = req.params.status
    const result = await equipmentService.getEquipmentsByStatus(status)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const updateEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.updateEquipment(equipmentId, req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const addMaintenanceRecord = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.addMaintenanceRecord(equipmentId, req.body)

    if (result.success) {
      res.status(StatusCodes.CREATED).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const updateMaintenanceRecord = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const maintenanceIndex = parseInt(req.params.maintenanceIndex)
    const result = await equipmentService.updateMaintenanceRecord(equipmentId, maintenanceIndex, req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteMaintenanceRecord = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const maintenanceIndex = parseInt(req.params.maintenanceIndex)
    const result = await equipmentService.deleteMaintenanceRecord(equipmentId, maintenanceIndex)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    console.log('🚀 ~ deleteEquipment ~ equipmentId:', equipmentId)
    const result = await equipmentService.deleteEquipment(equipmentId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const softDeleteEquipment = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.softDeleteEquipment(equipmentId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const searchEquipments = async (req, res, next) => {
  try {
    const searchTerm = req.query.q
    const result = await equipmentService.searchEquipments(searchTerm)

    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getMaintenanceHistory = async (req, res, next) => {
  try {
    const equipmentId = req.params.id
    const result = await equipmentService.getMaintenanceHistory(equipmentId)

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
  createEquipment,
  getEquipmentById,
  getEquipmentsByLocationId,
  getAllEquipments,
  getEquipmentsByStatus,
  updateEquipment,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  deleteEquipment,
  softDeleteEquipment,
  searchEquipments,
  getMaintenanceHistory,
}
