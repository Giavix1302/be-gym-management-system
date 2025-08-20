import express from 'express'
import { authController } from '../controller/auth.controller'
import { authValidation } from '~/modules/auth/validation/auth.validation.js'

const Router = express.Router()

Router.route('/login').post(authController.login)

Router.route('/signup').post(authValidation.signup, authController.signup)

Router.route('/verify').post(authController.verify)

export const authRoute = Router
