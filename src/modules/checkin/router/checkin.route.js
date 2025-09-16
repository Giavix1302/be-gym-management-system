import express from 'express'
import { checkinController } from '../controller/checkin.controller'
import { upload } from '~/config/cloudinary.config'
import { checkinValidation } from '../validation/checkin.validation'

const Router = express.Router()

Router.route('/').post(upload.array('checkinImgs', 6), checkinController.createNew)

Router.route('/:id')
  .get(checkinController.getDetail)
  .put(checkinValidation.updateInfo, checkinController.updateInfo) // update name, phone and address
  .delete(checkinController.deleteCheckin)

export const checkinRoute = Router
