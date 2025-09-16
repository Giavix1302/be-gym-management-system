import express from 'express'
import { bookingController } from '../controller/booking.controller'
import { upload } from '~/config/cloudinary.config'
import { bookingValidation } from '../validation/booking.validation'

const Router = express.Router()

Router.route('/').post(upload.array('bookingImgs', 6), bookingController.createNew)

Router.route('/:id')
  .get(bookingController.getDetail)
  .put(bookingValidation.updateInfo, bookingController.updateInfo) // update name, phone and address
  .delete(bookingController.deleteBooking)

export const bookingRoute = Router
