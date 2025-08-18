import express from 'express'
import { authController } from '../../controllers/auth.controller.js'

const Router = express.Router()

Router.route('/login').post(authController.login)

Router.route('/signup').post(authController.signup)

Router.route('/verify').post(authController.verify)

export const authRoute = Router
