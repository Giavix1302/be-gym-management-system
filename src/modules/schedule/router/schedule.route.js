import express from 'express'
import { scheduleController } from '../controller/schedule.controller'
import { upload } from '~/config/cloudinary.config'
import { scheduleValidation } from '../validation/schedule.validation'

const Router = express.Router()

Router.route('/').post(upload.array('scheduleImgs', 6), scheduleController.createNew)

Router.route('/:id')
  .get(scheduleController.getDetail)
  .put(scheduleValidation.updateInfo, scheduleController.updateInfo) // update name, phone and address
  .delete(scheduleController.deleteSchedule)

export const scheduleRoute = Router
