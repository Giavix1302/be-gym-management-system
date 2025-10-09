import { StatusCodes } from 'http-status-codes'

import { paymentService } from '../service/payment.service'

const createPaymentVnpay = async (req, res, next) => {
  try {
    const result = await paymentService.createPaymentVnpay(req.params)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const vnpReturn = async (req, res) => {
  try {
    const result = await paymentService.vnpReturn(req.query)

    if (result.success) {
      res.redirect(result.url)
    } else {
      res.redirect(result.url)
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const createPaymentBookingPtVnpay = async (req, res, next) => {
  try {
    const result = await paymentService.createPaymentBookingPtVnpay(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

const createPaymentClassVnpay = async (req, res, next) => {
  try {
    const result = await paymentService.createPaymentClassVnpay(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const paymentController = {
  createPaymentVnpay,
  vnpReturn,
  createPaymentBookingPtVnpay,
  createPaymentClassVnpay,
}
