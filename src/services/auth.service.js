import { sendOtpService, verifyOtp } from '../utils/twilio.js'
import { env } from '../config/environment.config.js'

import { userService } from './user.service.js'
import { handleHashedPassword, isMatch } from '../utils/bcrypt.js'
import { signToken } from '../utils/jwt.js'
import { saveUserTemp, getUserTemp } from '~/utils/redis.js'
import { userModel } from '~/models/user.model.js'

const login = async (reqBody) => {
  try {
    // handle data
    const { phone, password } = reqBody
    // Check database

    // check userName
    const account = await userModel.getDetailByPhone(phone)
    console.log('🚀 ~ login ~ account:', account)
    if (account === null) {
      return {
        success: false,
        message: 'The account does not exist.',
      }
    }
    // check password
    const result = await isMatch(password, account.password)
    if (!result) {
      return {
        success: false,
        message: 'Incorrect username or password.',
      }
    }

    // create token
    const token = signToken({
      userId: account._id,
      role: account.role,
    })

    const { _id, phone: userPhone, fullName, dateOfBirth, gender, role, status } = account

    return {
      success: true,
      message: 'Signed in successfully.',
      data: {
        _id,
        phone: userPhone,
        fullName,
        dateOfBirth,
        gender,
        role,
        status,
      },
      token,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const signup = async (reqBody) => {
  try {
    // get data
    const { phone } = reqBody
    // check existing user
    const existingUser = await userModel.getDetailByPhone(phone)

    if (existingUser !== null) {
      return {
        success: false,
        message: 'The user already exists',
      }
    }

    // mã hóa mật khẩu
    const { password } = reqBody
    const hashedPassword = await handleHashedPassword(password)

    const userData = {
      ...reqBody,
      password: hashedPassword,
    }
    // production
    if (process.env.NODE_ENV === 'production') {
      const result = await sendOtpService(phone)
      if (!result.success) return { success: false, message: result.message }

      await saveUserTemp(phone, userData)
      return {
        success: true,
        message: 'The OTP code has been sent',
      }
    }
    // development
    if (process.env.NODE_ENV === 'development') {
      await saveUserTemp(phone, userData)
      return {
        success: true,
        message: 'The OTP code has been sent',
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

// xác thực thành công -> lưu dữ lieuj vào database -> trả lại fe thông báo thành công
const verify = async (reqBody) => {
  try {
    const { phone, code } = reqBody

    if (process.env.NODE_ENV === 'production') {
      const result = await verifyOtp(phone, code)
      if (result.success) {
        // lưu dữ liệu vào database
      } else {
        return {
          success: false,
          message: result.message,
        }
      }
    }
    // development
    if (process.env.NODE_ENV === 'development') {
      if (code === '123456') {
        // lấy dữ liệu từ redis
        let userData = await getUserTemp(phone)
        console.log('🚀 ~ verify ~ userData:', userData)

        // them trường status
        userData = {
          ...userData,
          status: 'inactive',
        }

        // add dữ liệu vào database
        const result = await userModel.createNew(userData)
        console.log('🚀 ~ verify ~ result:', result)

        return {
          success: true,
          message: 'Account created successfully',
        }
      } else {
        return {
          success: false,
          message: 'Invalid code',
        }
      }
    }

    return {
      success: true,
      message: 'Account created successfully',
      // result,
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
