import express from 'express'
import { classController } from '../controller/class.controller'
import { upload } from '~/config/cloudinary.config'
import { classValidation } from '../validation/class.validation'

const Router = express.Router()

Router.route('/').post(upload.array('classImgs', 6), classController.createNew)

Router.route('/:id')
  .get(classController.getDetail)
  .put(classValidation.updateInfo, classController.updateInfo) // update name, phone and address
  .delete(classController.deleteClass)

export const classRoute = Router
