import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/user.service.js'
import { accountService } from '../services/account.service.js'
import { cartService } from '../services/cart.service.js'

/**
 *  
 */

const addToCart = async (req, res, next) => {
  try {
    const result = await cartService.addToCart(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

const getListCartDetail = async (req, res, next) => {
  try {
    const result = await cartService.getListCartDetail(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

const updateQuantity = async (req, res, next) => {
  try {
    const cartDetailId = req.params.id
    const quantity = req.body.quantity
    const result = await cartService.updateQuantity(cartDetailId, quantity)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

const deleteCartDetail = async (req, res, next) => {
  try {
    const cartDetailId = req.params.id

    const result = await cartService.deleteCartDetail(cartDetailId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

export const cartController = {
  addToCart,
  getListCartDetail,
  deleteCartDetail,
  updateQuantity
}