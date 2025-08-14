import express from 'express'
import { accountController } from '../../controllers/account.controller.js'
import { accountValidation } from '../../validations/account.validation.js'

const Router = express.Router()

Router.route('/login')
  .post(accountValidation.login, accountController.login)

Router.route('/signup')
  .post(accountValidation.signup, accountController.signup)

export const accountRoute = Router