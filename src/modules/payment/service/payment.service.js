import { membershipModel } from '~/modules/membership/model/membership.model'
import { subscriptionModel } from '~/modules/subscription/model/subscription.model'
import { PAYMENT_METHOD, PAYMENT_TYPE, SUBSCRIPTION_STATUS } from '~/utils/constants'
import { createPaymentURL, vnpay } from '~/utils/vnpay'
import { paymentModel } from '../model/payment.model'
import { convertVnpayDateToISO } from '~/utils/utils'

const createPaymentVnpay = async (params) => {
  try {
    // info sub
    const subscriptionInfo = await subscriptionModel.getDetailById(params.id)
    const { membershipId, userId } = subscriptionInfo
    console.log('🚀 ~ createPaymentVnpay ~ membershipId:', membershipId)

    // price, SubId, mess
    const membershipInfo = await membershipModel.getDetailById(membershipId.toString())
    const { price, name } = membershipInfo

    // create payment url: subId, price, name
    const paymentUrl = createPaymentURL(params.id, price, name)

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
      return {
        success: false,
        message: 'Payment failed',
      }
    }

    // get membershipId, userId
    const subscriptionInfo = await subscriptionModel.getDetailById(vnp_TxnRef)
    const { userId } = subscriptionInfo

    // create payment: userId, price, refId, paymentType, method, description
    const dataToSave = {
      userId: userId.toString(),
      referenceId: vnp_TxnRef,
      paymentType: PAYMENT_TYPE.MEMBERSHIP,
      amount: convertVnpayDateToISO(vnp_Amount),
      paymentDate: vnp_PayDate,
      paymentMethod: PAYMENT_METHOD.VNPAY,
      description: vnp_OrderInfo,
    }

    await paymentModel.createNew(dataToSave)

    return {
      success: true,
      message: 'Payment successful',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const paymentService = {
  createPaymentVnpay,
  vnpReturn,
}
