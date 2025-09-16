import express from 'express'
import { roomController } from '../controller/room.controller'
import { upload } from '~/config/cloudinary.config'
import { roomValidation } from '../validation/room.validation'

const Router = express.Router()

Router.route('/').post(upload.array('roomImgs', 6), roomController.createNew)

Router.route('/:id')
  .get(roomController.getDetail)
  .put(roomValidation.updateInfo, roomController.updateInfo) // update name, phone and address
  .delete(roomController.deleteRoom)

export const roomRoute = Router
