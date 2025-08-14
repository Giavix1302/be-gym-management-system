import express from 'express'
import { userController } from '../../controllers/user.controller.js'
import { userValidation } from '../../validations/user.validation.js'

const Router = express.Router()

Router.route('/')
  .post(userValidation.createNew, userController.createNew)

Router.route('/:id')
  .get(userController.getDetail)

export const userRoute = Router

