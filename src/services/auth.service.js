import { sendOtpService, verifyOtp } from '../utils/twilio.js'

import { userService } from './user.service.js'
import { handleHashedPassword, isMatch } from '../utils/bcrypt.js'
import { signToken } from '../utils/jwt.js'

const login = async (reqBody) => {
  try {
    // handle data
    const { userName, password } = reqBody
    // Check database
    // check userName
    // const account = await accountModel.getAccountByUserName(userName)
    // console.log('🚀 ~ login ~ account:', account)
    // if (account === null) {
    //   return {
    //     success: false,
    //     message: 'The account does not exist.',
    //   }
    // }
    // check password
    // const result = await isMatch(password, account.password)
    // if (!result) {
    //   return {
    //     success: false,
    //     message: 'Incorrect username or password.',
    //   }
    // }

    // // get user
    // const user = await userService.getDetail(account.userId)

    // // create token
    // const token = signToken({
    //   userId: user._id,
    //   role: user.role,
    // })
    // if user === user => get order, cart
    return {
      success: true,
      message: 'Signed in successfully.',
      data: {
        // (user.role === 'admin')
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const signup = async (reqBody) => {
  try {
    const { phone } = reqBody

    const result = await sendOtpService(phone)

    return {
      success: true,
      message: 'Account created successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const verify = async (reqBody) => {
  try {
    const { phone, code } = reqBody

    const result = await verifyOtp(phone, code)

    return {
      success: true,
      message: 'Account created successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const authService = {
  login,
  signup,
  verify,
}
