import express from 'express'
import { authController } from '../../controllers/auth.controller.js'
import { authValidation } from '~/validations/auth.validation.js'

const Router = express.Router()

Router.route('/login').post(authController.login)

Router.route('/signup').post(authValidation.signup, authController.signup)

Router.route('/verify').post(authController.verify)

export const authRoute = Router
