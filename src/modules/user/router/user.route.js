import express from 'express'
import { userController } from '~/modules/user/controller/user.controller.js'
import { userValidation } from '../validation/user.validation'

const Router = express.Router()

// Router.route('/')
//   .post(userValidation.createNew, userController.createNew)

Router.route('/').post(userController.createNew)

Router.route('/:id').get(userController.getDetail).put(userValidation.updateInfo, userController.updateInfo)

export const userRoute = Router
