/* eslint-disable quotes */
import { VNPay, ProductCode, VnpLocale, dateFormat } from 'vnpay'
import { env } from '~/config/environment.config'

export const vnpay = new VNPay({
  tmnCode: env.VNPAY_VNP_TMNCODE,
  secureSecret: env.VNPAY_VNP_HASHSECRET,
  vnpayHost: 'https://sandbox.vnpayment.vn',
  hashAlgorithm: 'SHA512',
  testMode: true,
  endpoints: {
    paymentEndpoint: 'paymentv2/vpcpay.html',
  },
})

export const createPaymentURL = (subId, price, name) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getMinutes() + 10)

  const paymentUrl = vnpay.buildPaymentUrl({
    vnp_Amount: price,
    vnp_IpAddr: '123.0.0.1',
    vnp_TxnRef: subId,
    vnp_OrderInfo: 'Thanh toán ' + name + ' mã: ' + subId,
    vnp_OrderType: ProductCode.Other,
    vnp_ReturnUrl: env.BE_URL + `/v1/payments/vnpay-return`,
    vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
    vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là thời gian hiện tại
    vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
  })
  return paymentUrl
}
