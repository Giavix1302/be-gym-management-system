import express from 'express'
import { upload } from '../../config/cloudinary.config.js'
import { productController } from '../../controllers/product.controller.js'
import { productValidation } from '../../validations/product.validation.js'

const Router = express.Router()

Router.route('/')
  .post(upload.single('image'), productController.addProduct)
  .get(productController.getListProduct)

Router.route('/:id')
  .put(upload.single('image'), productController.updateProduct) //  update quantity
  .delete(productController.deleteProduct) // delete cart

export const productRoute = Router

/**
 * add product: post /products/
 * update product: put /products/:id
 * delete product: delete /products/:id
 * get list product: get /products
 * 
 */