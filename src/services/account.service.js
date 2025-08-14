import { accountModel } from '../models/account.model.js'
import { userService } from './user.service.js'
import { handleHashedPassword, isMatch } from '../utils/bcrypt.js'
import { signToken } from '../utils/jwt.js'
import { productModel } from '../models/product.model.js'

const login = async (reqBody) => {
  try {
    // handle data
    const { userName, password } = reqBody
    // Check database
    // check userName
    const account = await accountModel.getAccountByUserName(userName)
    console.log('🚀 ~ login ~ account:', account)
    if (account === null) {
      return {
        success: false,
        message: 'The account doesn\'t exist.'
      }
    }
    // check password
    const result = await isMatch(password, account.password)
    if (!result) {
      return {
        success: false,
        message: 'Incorrect username or password.'
      }
    }

    // get user 
    const user = await userService.getDetail(account.userId)

    // create token
    const token = signToken({
      userId: user._id,
      role: user.role
    })
    // if user === user => get order, cart 
    return {
      success: true,
      message: 'Signed in successfully.',
      data: {
        user,
        // (user.role === 'admin')

      },
      token
    }
  } catch (error) {
    throw new Error(error)
  }
}

const signup = async (reqBody) => {
  try {
    // handle data
    const { userName, password, name, email, phone, role } = reqBody
    const hashedPassword = await handleHashedPassword(password)
    // Check database
    const existingUserName = await accountModel.getAccountByUserName(userName)

    if (existingUserName !== null) {
      return {
        success: false,
        message: 'Username already exists.',
      }
    }
    // 1. create user
    const user = { name, email, phone, role }

    const newUser = await userService.createNew(user)

    const { _id: userId } = newUser

    // 2. create account
    const account = { userName, hashedPassword, userId }

    await accountModel.createNew(account)

    const token = signToken({
      userId,
      role
    })

    return {
      success: true,
      message: 'Account created successfully',
      data: {
        user
      },
      token
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const accountService = {
  login,
  signup
}