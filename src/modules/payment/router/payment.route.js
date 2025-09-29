import express from 'express'
import { upload } from '~/config/cloudinary.config'
import { paymentController } from '../controller/payment.controller'

const Router = express.Router()

Router.route('/vnpay/subscription/:id').post(paymentController.createPaymentVnpay)
Router.route('/vnpay-return').get(paymentController.vnpReturn)
Router.route('/vnpay/booking').post(paymentController.createPaymentBookingPtVnpay)
export const paymentRoute = Router
