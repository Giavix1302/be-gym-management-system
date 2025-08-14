import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/user.service.js'

const createNew = async (req, res, next) => {
  try {
    const newUser = await userService.createNew(req.body)

    res.status(StatusCodes.CREATED).json(newUser)
  } catch (error) { next(error) }
}

const getDetail = async (req, res, next) => {
  try {
    const userId = req.params.id
    const user = await userService.getDetail(userId)
    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  getDetail
}