import { equipmentModel } from '../model/equipment.model'
// Import location model based on your project structure
// import { locationModel } from '~/modules/location/model/location.model'
import { EQUIPMENT_STATUS } from '~/utils/constants.js'
import { sanitize } from '~/utils/utils'

const createEquipment = async (data) => {
  try {
    const { locationId, name, brand, price, status, purchaseDate, maintenanceHistory } = data

    // Validate location exists (uncomment when location model is available)
    // const isLocationExist = await locationModel.getDetailById(locationId)
    // console.log('🚀 ~ createEquipment ~ isLocationExist:', isLocationExist)
    // if (isLocationExist === null) return { success: false, message: 'Location not found' }

    const dataToSave = {
      locationId,
      name: name.trim(),
      brand: brand.trim(),
      price,
      status: status || EQUIPMENT_STATUS.ACTIVE,
      purchaseDate: purchaseDate || '',
      maintenanceHistory: maintenanceHistory || [],
    }

    const result = await equipmentModel.createNew(dataToSave)

    return {
      success: true,
      message: 'Equipment created successfully',
      equipmentId: result.insertedId,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getEquipmentById = async (equipmentId) => {
  try {
    const equipment = await equipmentModel.getDetailById(equipmentId)
    console.log('🚀 ~ getEquipmentById ~ equipment:', equipment)

    if (equipment === null) {
      return {
        success: false,
        message: 'Equipment not found',
      }
    }

    return {
      success: true,
      message: 'Equipment retrieved successfully',
      equipment: sanitize(equipment),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getEquipmentsByLocationId = async (locationId) => {
  try {
    // Validate location exists (uncomment when location model is available)
    // const isLocationExist = await locationModel.getDetailById(locationId)
    // if (isLocationExist === null) return { success: false, message: 'Location not found' }

    const equipments = await equipmentModel.getEquipmentsByLocationId(locationId)
    console.log('🚀 ~ getEquipmentsByLocationId ~ equipments:', equipments)

    return {
      success: true,
      message: 'Location equipments retrieved successfully',
      equipments: equipments.map((equipment) => sanitize(equipment)),
      total: equipments.length,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getAllEquipments = async () => {
  try {
    const equipments = await equipmentModel.getAllEquipments()
    console.log('🚀 ~ getAllEquipments ~ equipments count:', equipments.length)

    return {
      success: true,
      message: 'All equipments retrieved successfully',
      equipments: equipments.map((equipment) => sanitize(equipment)),
      total: equipments.length,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getEquipmentsByStatus = async (status) => {
  try {
    const equipments = await equipmentModel.getEquipmentsByStatus(status)
    console.log('🚀 ~ getEquipmentsByStatus ~ equipments:', equipments)

    return {
      success: true,
      message: `Equipments with status '${status}' retrieved successfully`,
      equipments: equipments.map((equipment) => sanitize(equipment)),
      total: equipments.length,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateEquipment = async (equipmentId, data) => {
  try {
    // Check if equipment exists
    const isEquipmentExist = await equipmentModel.getDetailById(equipmentId)
    console.log('🚀 ~ updateEquipment ~ isEquipmentExist:', isEquipmentExist)
    if (isEquipmentExist === null) return { success: false, message: 'Equipment not found' }

    // If updating locationId, validate it exists (uncomment when location model is available)
    // if (data.locationId) {
    //   const isLocationExist = await locationModel.getDetailById(data.locationId)
    //   if (isLocationExist === null) return { success: false, message: 'Location not found' }
    // }

    const dataToUpdate = {}

    if (data.locationId) dataToUpdate.locationId = data.locationId
    if (data.name) dataToUpdate.name = data.name.trim()
    if (data.brand) dataToUpdate.brand = data.brand.trim()
    if (data.price !== undefined) dataToUpdate.price = data.price
    if (data.status) dataToUpdate.status = data.status
    if (data.purchaseDate !== undefined) dataToUpdate.purchaseDate = data.purchaseDate

    const result = await equipmentModel.updateInfo(equipmentId, dataToUpdate)
    console.log('🚀 ~ updateEquipment ~ result:', result)

    if (result === null) {
      return {
        success: false,
        message: 'Failed to update equipment',
      }
    }

    return {
      success: true,
      message: 'Equipment updated successfully',
      equipment: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const addMaintenanceRecord = async (equipmentId, maintenanceData) => {
  try {
    // Check if equipment exists
    const isEquipmentExist = await equipmentModel.getDetailById(equipmentId)
    if (isEquipmentExist === null) return { success: false, message: 'Equipment not found' }

    const maintenanceRecord = {
      date: maintenanceData.date,
      details: maintenanceData.details.trim(),
      technician: maintenanceData.technician.trim(),
      cost: maintenanceData.cost || 0,
    }

    const result = await equipmentModel.addMaintenanceRecord(equipmentId, maintenanceRecord)
    console.log('🚀 ~ addMaintenanceRecord ~ result:', result)

    if (result === null) {
      return {
        success: false,
        message: 'Failed to add maintenance record',
      }
    }

    return {
      success: true,
      message: 'Maintenance record added successfully',
      equipment: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateMaintenanceRecord = async (equipmentId, maintenanceIndex, updateData) => {
  try {
    // Check if equipment exists
    const equipment = await equipmentModel.getDetailById(equipmentId)
    if (equipment === null) return { success: false, message: 'Equipment not found' }

    // Check if maintenance record index is valid
    if (
      !equipment.maintenanceHistory ||
      maintenanceIndex >= equipment.maintenanceHistory.length ||
      maintenanceIndex < 0
    ) {
      return { success: false, message: 'Invalid maintenance record index' }
    }

    const updatedRecord = {}
    if (updateData.date) updatedRecord.date = updateData.date
    if (updateData.details) updatedRecord.details = updateData.details.trim()
    if (updateData.technician) updatedRecord.technician = updateData.technician.trim()
    if (updateData.cost !== undefined) updatedRecord.cost = updateData.cost

    const result = await equipmentModel.updateMaintenanceRecord(equipmentId, maintenanceIndex, updatedRecord)
    console.log('🚀 ~ updateMaintenanceRecord ~ result:', result)

    if (result === null) {
      return {
        success: false,
        message: 'Failed to update maintenance record',
      }
    }

    return {
      success: true,
      message: 'Maintenance record updated successfully',
      equipment: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteMaintenanceRecord = async (equipmentId, maintenanceIndex) => {
  try {
    // Check if equipment exists
    const equipment = await equipmentModel.getDetailById(equipmentId)
    if (equipment === null) return { success: false, message: 'Equipment not found' }

    // Check if maintenance record index is valid
    if (
      !equipment.maintenanceHistory ||
      maintenanceIndex >= equipment.maintenanceHistory.length ||
      maintenanceIndex < 0
    ) {
      return { success: false, message: 'Invalid maintenance record index' }
    }

    const result = await equipmentModel.deleteMaintenanceRecord(equipmentId, maintenanceIndex)
    console.log('🚀 ~ deleteMaintenanceRecord ~ result:', result)

    if (result === null) {
      return {
        success: false,
        message: 'Failed to delete maintenance record',
      }
    }

    return {
      success: true,
      message: 'Maintenance record deleted successfully',
      equipment: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteEquipment = async (equipmentId) => {
  try {
    // Check if equipment exists
    const isEquipmentExist = await equipmentModel.getDetailById(equipmentId)
    console.log('🚀 ~ deleteEquipment ~ isEquipmentExist:', isEquipmentExist)
    if (isEquipmentExist === null) return { success: false, message: 'Equipment not found' }

    // TODO: Add business logic validation
    // - Check if equipment is currently in use
    // - Check if equipment has active bookings
    // Example:
    // if (isEquipmentExist.status === EQUIPMENT_STATUS.ACTIVE) {
    //   return { success: false, message: 'Cannot delete active equipment. Please set status to broken or maintenance first.' }
    // }

    const result = await equipmentModel.deleteEquipment(equipmentId)
    console.log('🚀 ~ deleteEquipment ~ result:', result)

    if (result === 0) {
      return {
        success: false,
        message: 'Failed to delete equipment',
      }
    }

    return {
      success: true,
      message: 'Equipment deleted successfully',
      deletedCount: result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const softDeleteEquipment = async (equipmentId) => {
  try {
    // Check if equipment exists
    const isEquipmentExist = await equipmentModel.getDetailById(equipmentId)
    console.log('🚀 ~ softDeleteEquipment ~ isEquipmentExist:', isEquipmentExist)
    if (isEquipmentExist === null) return { success: false, message: 'Equipment not found' }

    const result = await equipmentModel.softDeleteEquipment(equipmentId)
    console.log('🚀 ~ softDeleteEquipment ~ result:', result)

    if (result === null) {
      return {
        success: false,
        message: 'Failed to soft delete equipment',
      }
    }

    return {
      success: true,
      message: 'Equipment soft deleted successfully',
      equipment: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const searchEquipments = async (searchTerm) => {
  try {
    const equipments = await equipmentModel.searchEquipments(searchTerm)
    console.log('🚀 ~ searchEquipments ~ equipments:', equipments)

    return {
      success: true,
      message: 'Equipment search completed successfully',
      equipments: equipments.map((equipment) => sanitize(equipment)),
      total: equipments.length,
      searchTerm,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getMaintenanceHistory = async (equipmentId) => {
  try {
    const equipment = await equipmentModel.getDetailById(equipmentId)
    if (equipment === null) return { success: false, message: 'Equipment not found' }

    return {
      success: true,
      message: 'Maintenance history retrieved successfully',
      maintenanceHistory: equipment.maintenanceHistory || [],
      equipmentName: equipment.name,
      equipmentBrand: equipment.brand,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const equipmentService = {
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
