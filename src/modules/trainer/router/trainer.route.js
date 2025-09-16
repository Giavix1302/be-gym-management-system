import express from 'express'
import { upload } from '~/config/cloudinary.config'
import { trainerController } from '../controller/trainer.controller'
import { trainerValidation } from '../validation/trainer.validation'

const Router = express.Router()

// Router.route('/')
//   .post(userValidation.createNew, userController.createNew)

Router.route('/').post(upload.array('physiqueImages', 6), trainerController.createNew)

Router.route('/:id')
  .get(trainerController.getDetailByUserId)
  .put(upload.array('physiqueImagesNew', 6), trainerController.updateInfo)

export const trainerRoute = Router
