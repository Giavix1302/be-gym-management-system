import express from 'express'
import { membershipController } from '../controller/membership.controller'
import { upload } from '~/config/cloudinary.config'
import { authMiddleware } from '~/middlewares/auth.middleware'

const Router = express.Router()

Router.route('/')
  .post(upload.single('banner'), membershipController.addMembership)
  .get(membershipController.getListMembership)

Router.route('/:id')
  .put(authMiddleware, upload.single('banner'), membershipController.updateMemberShip)
  .delete(authMiddleware, membershipController.deleteMembership)

export const memberRoute = Router
