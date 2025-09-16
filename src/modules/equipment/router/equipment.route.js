import express from 'express'
import { equipmentController } from '../controller/equipment.controller'
import { upload } from '~/config/cloudinary.config'
import { equipmentValidation } from '../validation/equipment.validation'

const Router = express.Router()

Router.route('/').post(upload.array('equipmentImgs', 6), equipmentController.createNew)

Router.route('/:id')
  .get(equipmentController.getDetail)
  .put(equipmentValidation.updateInfo, equipmentController.updateInfo) // update name, phone and address
  .delete(equipmentController.deleteEquipment)

export const equipmentRoute = Router
