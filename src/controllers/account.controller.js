import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/user.service.js'
import { accountService } from '../services/account.service.js'

const login = async (req, res, next) => {
  try {
    const result = await accountService.login(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

const signup = async (req, res, next) => {
  try {
    const result = await accountService.signup(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) { next(error) }
}

export const accountController = {
  login,
  signup
}