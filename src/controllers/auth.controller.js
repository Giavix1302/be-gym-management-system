import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service.js'
import { accountService } from '~/services/account.service.js'
import { authService } from '~/services/auth.service.js'

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const verify = async (req, res, next) => {
  try {
    const result = await authService.verify(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const authController = {
  login,
  signup,
  verify,
}
