import express from 'express'
import { equipmentController } from '../controller/equipment.controller'
import { equipmentValidation } from '../validation/equipment.validation'

const Router = express.Router()

// Base route: /api/equipments
Router.route('/')
  // Create new equipment
  .post(equipmentValidation.createEquipment, equipmentController.createEquipment)
  // Get all equipments
  .get(equipmentController.getAllEquipments)

// Route for searching equipments: /api/equipments/search?q=searchTerm
Router.route('/search').get(equipmentValidation.validateSearchQuery, equipmentController.searchEquipments)

// Route for equipments by status: /api/equipments/status/:status
Router.route('/status/:status').get(
  equipmentValidation.validateStatus,
  equipmentController.getEquipmentsByStatus
)

// Route for location's equipments: /api/equipments/location/:locationId
Router.route('/location/:locationId').get(
  equipmentValidation.validateLocationId,
  equipmentController.getEquipmentsByLocationId
)

// Route for specific equipment by ID: /api/equipments/:id
Router.route('/:id')
  // Get equipment by ID
  .get(equipmentValidation.validateEquipmentId, equipmentController.getEquipmentById)
  // Update equipment by ID
  .put(
    equipmentValidation.validateEquipmentId,
    equipmentValidation.updateEquipment,
    equipmentController.updateEquipment
  )
  // Delete equipment by ID (hard delete)
  .delete(equipmentValidation.validateEquipmentId, equipmentController.deleteEquipment)

// Route for soft delete: /api/equipments/:id/soft-delete
Router.route('/:id/soft-delete').patch(
  equipmentValidation.validateEquipmentId,
  equipmentController.softDeleteEquipment
)

// Route for maintenance history: /api/equipments/:id/maintenance
Router.route('/:id/maintenance')
  // Get maintenance history
  .get(equipmentValidation.validateEquipmentId, equipmentController.getMaintenanceHistory)
  // Add new maintenance record
  .post(
    equipmentValidation.validateEquipmentId,
    equipmentValidation.addMaintenanceRecord,
    equipmentController.addMaintenanceRecord
  )

// Route for specific maintenance record: /api/equipments/:id/maintenance/:maintenanceIndex
Router.route('/:id/maintenance/:maintenanceIndex')
  // Update specific maintenance record
  .put(
    equipmentValidation.validateMaintenanceIndex,
    equipmentValidation.updateMaintenanceRecord,
    equipmentController.updateMaintenanceRecord
  )
  // Delete specific maintenance record
  .delete(equipmentValidation.validateMaintenanceIndex, equipmentController.deleteMaintenanceRecord)

export const equipmentRoute = Router
