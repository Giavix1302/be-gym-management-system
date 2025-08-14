import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/user.service.js'
import { accountService } from '../services/account.service.js'
import { productService } from '../services/product.service.js'

/**
 *  
 */

const addProduct = async (req, res, next) => {
  try {
    const result = await productService.addProduct(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) { next(error) }
}

const getListProduct = async (req, res, next) => {
  try {
    const result = await productService.getListProduct()

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) { next(error) }
}

const updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) { next(error) }
}

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id

    const result = await productService.deleteProduct(productId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) { next(error) }
}

export const productController = {
  addProduct,
  updateProduct,
  deleteProduct,
  getListProduct
}