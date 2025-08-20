import express from 'express'
import { membershipController } from '../controller/membership.controller'
import { membershipValidation } from '../validation/membership.validation'
import { upload } from '~/config/cloudinary.config'

const Router = express.Router()

Router.route('/').post(upload.single('banner'), membershipController.addMembership)
// .get(membershipController.getListCartDetail)

// Router.route('/:id')
//   .put(cartValidation.updateQuantity, cartController.updateQuantity) //  update quantity
//   .delete(cartController.deleteCartDetail) // delete cart

export const memberRoute = Router
