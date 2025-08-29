import express from 'express'
import { upload } from '~/config/cloudinary.config'
import { paymentController } from '../controller/payment.controller'

const Router = express.Router()

Router.route('/vnpay/:id').post(paymentController.createPaymentVnpay)
Router.route('/vnpay-return').get(paymentController.vnpReturn)
export const paymentRoute = Router
