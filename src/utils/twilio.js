import twilio from 'twilio'
import { env } from '~/config/environment.config.js'

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

export const sendOtpService = async (phoneNumber) => {
  try {
    const verification = await client.verify.v2.services(env.TWILIO_VERIFY_SERVICE_SID).verifications.create({
      to: phoneNumber,
      channel: 'sms', // có thể "call" nếu muốn gửi OTP qua cuộc gọi
    })

    return {
      success: true,
      sid: verification.sid,
      status: verification.status, // pending = đã gửi OTP
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}

export const verifyOtp = async (phoneNumber, code) => {
  try {
    const verification_check = await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID) // Service SID bạn tạo trong Twilio Verify
      .verificationChecks.create({ to: phoneNumber, code })

    if (verification_check.status === 'approved') {
      return { success: true, message: 'OTP verified successfully' }
    } else {
      return { success: false, message: 'Invalid code' }
    }
  } catch (err) {
    console.error('Error verifying OTP:', err)
    return { success: false, message: 'Server error' }
  }
}
