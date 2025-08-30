import express from 'express'
import { locationController } from '../controller/location.controller'
import { upload } from '~/config/cloudinary.config'

const Router = express.Router()

Router.route('/').post(upload.array('locationImgs', 6), locationController.createNew)

Router.route('/:id')
  .get(locationController.getDetail)
  .put(locationController.updateInfo)
  .delete(locationController.deleteLocation)

export const locationRoute = Router
