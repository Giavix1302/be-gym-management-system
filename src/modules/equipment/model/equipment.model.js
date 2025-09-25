import { ObjectId, ReturnDocument } from 'mongodb'
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb.config.js'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { EQUIPMENT_STATUS } from '~/utils/constants.js'

const EQUIPMENT_COLLECTION_NAME = 'equipments'
const EQUIPMENT_COLLECTION_SCHEMA = Joi.object({
  locationId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  name: Joi.string().required().min(2).max(100).trim().strict(),
  brand: Joi.string().required().min(1).max(50).trim().strict(),
  price: Joi.number().min(0).required(),

  status: Joi.string()
    .valid(EQUIPMENT_STATUS.ACTIVE, EQUIPMENT_STATUS.MAINTENANCE, EQUIPMENT_STATUS.BROKEN)
    .default(EQUIPMENT_STATUS.ACTIVE),

  purchaseDate: Joi.string().isoDate().allow('').default(''),

  maintenanceHistory: Joi.array()
    .items(
      Joi.object({
        date: Joi.string().isoDate().required(),
        details: Joi.string().min(1).max(500).trim().strict().required(),
        technician: Joi.string().min(1).max(100).trim().strict().required(),
        cost: Joi.number().min(0).optional(),
      })
    )
    .default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
})

const validateBeforeCreate = async (data) => {
  return await EQUIPMENT_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data, { abortEarly: false })

    const newEquipmentToAdd = {
      ...validData,
      locationId: new ObjectId(String(validData.locationId)),
    }

    const createdEquipment = await GET_DB().collection(EQUIPMENT_COLLECTION_NAME).insertOne(newEquipmentToAdd)
    return createdEquipment
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailById = async (equipmentId) => {
  try {
    const equipment = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(equipmentId)),
        _destroy: { $ne: true },
      })
    return equipment
  } catch (error) {
    throw new Error(error)
  }
}

const getEquipmentsByLocationId = async (locationId) => {
  try {
    const equipments = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .find({
        locationId: new ObjectId(String(locationId)),
        _destroy: { $ne: true },
      })
      .toArray()
    return equipments
  } catch (error) {
    throw new Error(error)
  }
}

const getAllEquipments = async () => {
  try {
    const equipments = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .find({
        _destroy: { $ne: true },
      })
      .toArray()
    return equipments
  } catch (error) {
    throw new Error(error)
  }
}

const getEquipmentsByStatus = async (status) => {
  try {
    const equipments = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .find({
        status,
        _destroy: { $ne: true },
      })
      .toArray()
    return equipments
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (equipmentId, updateData) => {
  try {
    const dataToUpdate = { ...updateData }

    // Convert locationId to ObjectId if it's being updated
    if (dataToUpdate.locationId) {
      dataToUpdate.locationId = new ObjectId(String(dataToUpdate.locationId))
    }

    const updated = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(equipmentId)), _destroy: { $ne: true } },
        { $set: { ...dataToUpdate, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const addMaintenanceRecord = async (equipmentId, maintenanceRecord) => {
  try {
    const updated = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(equipmentId)), _destroy: { $ne: true } },
        {
          $push: { maintenanceHistory: maintenanceRecord },
          $set: { updatedAt: Date.now() },
        },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const updateMaintenanceRecord = async (equipmentId, maintenanceIndex, updatedRecord) => {
  try {
    const setField = {}
    Object.keys(updatedRecord).forEach((key) => {
      setField[`maintenanceHistory.${maintenanceIndex}.${key}`] = updatedRecord[key]
    })

    const updated = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(equipmentId)), _destroy: { $ne: true } },
        {
          $set: { ...setField, updatedAt: Date.now() },
        },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const deleteMaintenanceRecord = async (equipmentId, maintenanceIndex) => {
  try {
    // First get the equipment to remove the specific maintenance record
    const equipment = await getDetailById(equipmentId)
    if (!equipment || !equipment.maintenanceHistory) return null

    const updatedHistory = equipment.maintenanceHistory.filter((_, index) => index !== maintenanceIndex)

    const updated = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(equipmentId)), _destroy: { $ne: true } },
        {
          $set: { maintenanceHistory: updatedHistory, updatedAt: Date.now() },
        },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

const deleteEquipment = async (equipmentId) => {
  try {
    const deleted = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(equipmentId)) })
    return deleted.deletedCount
  } catch (error) {
    throw new Error(error)
  }
}

// Soft delete by setting _destroy flag
const softDeleteEquipment = async (equipmentId) => {
  try {
    const updated = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(equipmentId)) },
        { $set: { _destroy: true, updatedAt: Date.now() } },
        { returnDocument: 'after' }
      )
    return updated
  } catch (error) {
    throw new Error(error)
  }
}

// Search equipments by name or brand
const searchEquipments = async (searchTerm) => {
  try {
    const equipments = await GET_DB()
      .collection(EQUIPMENT_COLLECTION_NAME)
      .find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } },
        ],
        _destroy: { $ne: true },
      })
      .toArray()
    return equipments
  } catch (error) {
    throw new Error(error)
  }
}

export const equipmentModel = {
  EQUIPMENT_COLLECTION_NAME,
  EQUIPMENT_COLLECTION_SCHEMA,
  createNew,
  getDetailById,
  getEquipmentsByLocationId,
  getAllEquipments,
  getEquipmentsByStatus,
  updateInfo,
  addMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  deleteEquipment,
  softDeleteEquipment,
  searchEquipments,
}
