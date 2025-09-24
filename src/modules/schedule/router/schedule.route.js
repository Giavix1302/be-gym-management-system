import express from 'express'
import { scheduleController } from '../controller/schedule.controller'
import { upload } from '~/config/cloudinary.config'
import { scheduleValidation } from '../validation/schedule.validation'

const Router = express.Router()

Router.route('/')
  .post(scheduleValidation.createNew, scheduleController.createNew)
  .delete(scheduleController.deleteListSchedule)

Router.route('/:id')
  .get(scheduleController.getListScheduleByTrainerId)
  .put(scheduleValidation.updateInfo, scheduleController.updateInfo)
  .delete(scheduleController.deleteSchedule)

export const scheduleRoute = Router
