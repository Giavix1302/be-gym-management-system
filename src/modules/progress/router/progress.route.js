import express from 'express'
import { upload } from '~/config/cloudinary.config'
import { progressController } from '../controller/progress.controller'
import { progressValidation } from '../validation/progress.validation'

const Router = express.Router()

Router.route('/').post(upload.array('locationImgs', 6), progressController.createNew)

Router.route('/:id')
  .get(progressController.getDetail)
  .put(progressValidation.updateInfo, progressController.updateInfo) // update name, phone and address
  .delete(progressController.deleteLocation)

export const progressRoute = Router
