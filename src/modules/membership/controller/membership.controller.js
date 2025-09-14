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

const updateMemberShip = async (req, res, next) => {
  try {
    const result = await membershipService.updateMemberShip(req)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const deleteMembership = async (req, res, next) => {
  try {
    const membershipId = req.params.id

    const result = await membershipService.deleteMembership(membershipId)

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
  updateMemberShip,
  deleteMembership,
  getListMembership,
}
