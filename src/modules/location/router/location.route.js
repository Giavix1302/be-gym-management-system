import express from 'express'
import { locationController } from '../controller/location.controller'
import { upload } from '~/config/cloudinary.config'
import { locationValidation } from '../validation/location.validation'

const Router = express.Router()

Router.route('/').post(upload.array('locationImgs', 6), locationController.createNew)

Router.route('/:id')
  .get(locationController.getDetail)
  .put(locationValidation.updateInfo, locationController.updateInfo) // update name, phone and address
  .delete(locationController.deleteLocation)

export const locationRoute = Router
