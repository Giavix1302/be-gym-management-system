import express from 'express'
import { classEnrollmentController } from '../controller/classEnrollment.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'

const Router = express.Router()

Router.route('/')
  .post(classEnrollmentController.addClassEnrollment)
  .get(classEnrollmentController.getListClassEnrollment)

Router.route('/:id')
  .put(authMiddleware, classEnrollmentController.updateClassEnrollment)
  .delete(authMiddleware, classEnrollmentController.deleteClassEnrollment)

export const classEnrollmentRoute = Router
