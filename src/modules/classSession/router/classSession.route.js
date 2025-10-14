import express from 'express'
import { classSessionController } from '../controller/classSession.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'

const Router = express.Router()

Router.route('/')
  .post(authMiddleware, classSessionController.addClassSession)
  .get(classSessionController.getListClassSession)

Router.route('/:id')
  .put(classSessionController.updateClassSession)
  .delete(authMiddleware, classSessionController.deleteClassSession)

export const classSessionRoute = Router
