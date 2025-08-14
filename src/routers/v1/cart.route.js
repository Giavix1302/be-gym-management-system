import express from 'express'
import { cartController } from '../../controllers/cart.controller.js'
import { cartValidation } from '../../validations/cart.validation.js'
import { GridFSBucket } from 'mongodb'

const Router = express.Router()

Router.route('/')
  .post(cartValidation.addToCart, cartController.addToCart) 
  .get(cartController.getListCartDetail)

Router.route('/:id')
  .put(cartValidation.updateQuantity, cartController.updateQuantity) //  update quantity
  .delete(cartController.deleteCartDetail) // delete cart

export const cartRoute = Router

/**
 * cart:
 * thêm   post: /carts
 * sửa số lượng put: /carts/:id
 * xóa delete: /carts/:id 
 * func get cart get: /carts
 * 
 * 
 */