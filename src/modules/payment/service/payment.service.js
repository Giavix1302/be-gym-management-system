import { membershipModel } from '~/modules/membership/model/membership.model'
import { subscriptionModel } from '~/modules/subscription/model/subscription.model'
import { PAYMENT_METHOD, PAYMENT_STATUS, PAYMENT_TYPE, SUBSCRIPTION_STATUS } from '~/utils/constants'
import { createPaymentURL, vnpay } from '~/utils/vnpay'
import { paymentModel } from '../model/payment.model'
import {
  calculateDiscountedPrice,
  calculateEndDate,
  convertVnpayDateToISO,
  countRemainingDays,
  createRedirectUrl,
} from '~/utils/utils'
import { env } from '~/config/environment.config'
import { deleteLinkPaymentTemp, saveLinkPaymentTemp } from '~/utils/redis'

const createPaymentVnpay = async (params) => {
  try {
    // info sub
    const subscriptionInfo = await subscriptionModel.getDetailById(params.id)
    const { membershipId, userId } = subscriptionInfo
    console.log('🚀 ~ createPaymentVnpay ~ membershipId:', membershipId)

    // price, SubId, mess
    const membershipInfo = await membershipModel.getDetailById(membershipId.toString())
    const { price, name, discount } = membershipInfo

    // create payment url: subId, price, name
    const paymentUrl = createPaymentURL(params.id, calculateDiscountedPrice(price, discount).finalPrice, name)

    const expireAt = new Date(Date.now() + 10 * 60 * 1000)
    await saveLinkPaymentTemp(params.id, {
      paymentUrl,
      expireAt: expireAt.toISOString(),
    })

    return {
      success: true,
      paymentUrl,
    }
  } catch (error) {
    throw new Error(error)
  }
}

// 🚀 ~ vnpReturn ~ verify: {
//   vnp_Amount: 300000,
//   vnp_BankCode: 'NCB',
//   vnp_BankTranNo: 'VNP15141635',
//   vnp_CardType: 'ATM',
//   vnp_OrderInfo: 'Thanh toán Trọn gói tập gym 1 tháng mã: 68a70226139fa5dda393d979',
//   vnp_PayDate: '20250821213944',
//   vnp_ResponseCode: '00',
//   vnp_TmnCode: 'I75N6KW3',
//   vnp_TransactionNo: '15141635',
//   vnp_TransactionStatus: '00',
//   vnp_TxnRef: '68a70226139fa5dda393d979',
//   isVerified: true,
//   isSuccess: true,
//   message: 'Giao dịch thành công'
// }

const vnpReturn = async (query) => {
  try {
    const verify = vnpay.verifyReturnUrl(query) // verify chữ ký
    console.log('🚀 ~ vnpReturn ~ verify:', verify)
    const { vnp_TransactionStatus, vnp_TxnRef, vnp_Amount, vnp_OrderInfo, vnp_PayDate } = verify

    if (vnp_TransactionStatus === '02') {
      // xóa subscription
      await subscriptionModel.deleteSubscription(vnp_TxnRef)
      await deleteLinkPaymentTemp(vnp_TxnRef)

      return {
        success: false,
        url: `${env.FE_URL}/user/payment/failed`,
      }
    }

    // get membershipId, userId
    const subscriptionInfo = await subscriptionModel.getDetailById(vnp_TxnRef)
    const { userId, membershipId } = subscriptionInfo
    const membershipInfo = await membershipModel.getDetailById(membershipId)
    const { durationMonth } = membershipInfo

    // create payment: userId, price, refId, paymentType, method, description
    const dataToSave = {
      userId: userId.toString(),
      referenceId: vnp_TxnRef,
      paymentType: PAYMENT_TYPE.MEMBERSHIP,
      amount: vnp_Amount,
      paymentDate: convertVnpayDateToISO(vnp_PayDate),
      paymentMethod: PAYMENT_METHOD.VNPAY,
      description: vnp_OrderInfo,
    }
    console.log('🚀 ~ vnpReturn ~ dataToSave:', dataToSave)
    await paymentModel.createNew(dataToSave)

    // update subscription
    const dataUpdateSub = {
      startDate: convertVnpayDateToISO(vnp_PayDate),
      endDate: calculateEndDate(convertVnpayDateToISO(vnp_PayDate), durationMonth),
      status: SUBSCRIPTION_STATUS.ACTIVE,
      paymentStatus: PAYMENT_STATUS.PAID,
      remainingSessions: countRemainingDays(
        calculateEndDate(convertVnpayDateToISO(vnp_PayDate), durationMonth)
      ),
    }

    await subscriptionModel.updateInfoWhenPaymentSuccess(vnp_TxnRef, dataUpdateSub)

    await deleteLinkPaymentTemp(vnp_TxnRef)

    const baseUrl = `${env.FE_URL}/user/payment/success?`

    const redirectUrl = createRedirectUrl(verify, baseUrl, 'vnpay')

    return {
      success: true,
      url: redirectUrl,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const paymentService = {
  createPaymentVnpay,
  vnpReturn,
}
