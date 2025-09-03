import { StatusCodes } from 'http-status-codes'
import { membershipService } from '../service/membership.service'

/**
 *
 */

const addMembership = async (req, res, next) => {
  try {
    const result = await membershipService.addMembership(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const getListMembership = async (req, res, next) => {
  try {
    const result = await membershipService.getListMembership()

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const result = await membershipService.updateProduct(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id

    const result = await membershipService.deleteProduct(productId)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const membershipController = {
  addMembership,
  updateProduct,
  deleteProduct,
  getListMembership,
}
