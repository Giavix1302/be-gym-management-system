import { sendOtpService, verifyOtp } from '~/utils/twilio.js'
import { handleHashedPassword, isMatch } from '~/utils/bcrypt.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt.js'
import { saveUserTemp, getUserTemp } from '~/utils/redis.js'
import { userModel } from '~/modules/user/model/user.model.js'
import { sanitize } from '~/utils/utils.js'
import { subscriptionService } from '~/modules/subscription/service/subscription.service'
import { trainerService } from '~/modules/trainer/service/trainer.service'

const login = async (reqBody) => {
  try {
    const { phone, password } = reqBody

    // check user in DB
    const account = await userModel.getDetailByPhone(phone)
    if (!account) {
      return { success: false, message: 'The account does not exist.' }
    }

    // check password
    const match = await isMatch(password, account.password)
    if (!match) {
      return { success: false, message: 'Incorrect phone or password.' }
    }

    // generate tokens
    const payload = { userId: account._id, role: account.role }
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    // ---- get myMembership ----
    // name membership
    // durationMonth membership
    // total check in
    // startDate subscription
    // endDate subscription
    // remainingSessions subscription

    // user
    if (account.role === 'user') {
      const subscriptionInfo = await subscriptionService.getSubDetailByUserId(account._id)

      if (!subscriptionInfo.success)
        return {
          success: true,
          message: 'Signed in successfully.',
          user: sanitize(account),
          myMembership: {
            remainingSessions: 0,
            startDate: '',
            endDate: '',
            status: '',
            name: '',
            durationMonth: 0,
            bannerURL: '',
            totalCheckin: 0,
          },
          accessToken,
          refreshToken, // controller sẽ set cookie
        }

      const { remainingSessions, startDate, endDate, status, name, durationMonth, bannerURL } =
        subscriptionInfo.subscription

      return {
        success: true,
        message: 'Signed in successfully.',
        user: sanitize(account),
        myMembership: {
          remainingSessions,
          startDate,
          endDate,
          status,
          name,
          durationMonth,
          bannerURL,
          totalCheckin: 0, // làm sau
        },
        accessToken,
        refreshToken, // controller sẽ set cookie
      }
    }

    if (account.role === 'pt') {
      const trainerInfo = await trainerService.getDetailByUserId(account._id)

      return {
        success: true,
        message: 'Signed in successfully.',
        user: sanitize(account),
        trainer: {
          ...trainerInfo.trainer,
        },
        accessToken,
        refreshToken, // controller sẽ set cookie
      }
    }

    if (account.role === 'admin') {
      return {
        success: true,
        message: 'Signed in successfully.',
        user: sanitize(account),
        accessToken,
        refreshToken, // controller sẽ set cookie
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const signup = async (reqBody) => {
  try {
    const { phone, password } = reqBody
    const existingUser = await userModel.getDetailByPhone(phone)

    if (existingUser) {
      return { success: false, message: 'The user already exists' }
    }

    const hashedPassword = await handleHashedPassword(password)
    const userData = { ...reqBody, password: hashedPassword }

    // Production → gửi OTP qua Twilio
    if (process.env.NODE_ENV === 'production') {
      const result = await sendOtpService(phone)
      if (!result.success) return { success: false, message: result.message }

      await saveUserTemp(phone, userData)
      return { success: true, message: 'The OTP code has been sent' }
    }

    // Dev → bypass OTP
    if (process.env.NODE_ENV === 'development') {
      await saveUserTemp(phone, userData)
      return { success: true, message: 'The OTP code has been sent' }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const verify = async (reqBody) => {
  try {
    const { phone, code } = reqBody
    // production
    if (process.env.NODE_ENV === 'production') {
      const result = await verifyOtp(phone, code)
      if (result.success) {
        // lấy dữ liệu từ redis
        let userData = await getUserTemp(phone)
        console.log('🚀 ~ verify ~ userData:', userData)

        // them trường status
        userData = {
          ...userData,
          status: 'inactive',
        }
        // tạo user và lấy dữ liệu user mới tạo
        const result = await userModel.createNew(userData)
        const user = await userModel.getDetailById(result.insertedId)

        // generate tokens
        const payload = { userId: user._id, role: user.role }
        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        return {
          success: true,
          message: 'Account created successfully',
          user: sanitize(user),
          accessToken,
          refreshToken,
        }
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
        // tạo user và lấy dữ liệu user mới tạo
        const result = await userModel.createNew(userData)
        const user = await userModel.getDetailById(result.insertedId)

        // generate tokens
        const payload = { userId: user._id, role: user.role }
        const accessToken = signAccessToken(payload)
        const refreshToken = signRefreshToken(payload)

        return {
          success: true,
          message: 'Account created successfully',
          user: sanitize(user),
          accessToken,
          refreshToken,
        }
      } else {
        return {
          success: false,
          message: 'Invalid OTP code. Please try again.',
        }
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}

const refresh = async (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken)

    const payload = { userId: decoded.userId, role: decoded.role }
    const accessToken = signAccessToken(payload)

    return { success: true, accessToken }
  } catch (error) {
    return { success: false, message: 'Invalid or expired refresh token' }
  }
}

export const authService = {
  login,
  signup,
  verify,
  refresh,
}
