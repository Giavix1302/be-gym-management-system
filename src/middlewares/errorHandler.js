import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export const errorHandler = (err, req, res, next) => {
  console.error('❌ ERROR:', err.stack || err)

  // Nếu lỗi đã có statusCode → dùng, không thì dùng 500
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
  const message = err.message || ReasonPhrases.INTERNAL_SERVER_ERROR

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}