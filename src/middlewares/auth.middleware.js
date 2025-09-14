import { verifyAccessToken } from '~/utils/jwt.js'
import { StatusCodes } from 'http-status-codes'

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized: Missing token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = verifyAccessToken(token)
    req.user = decoded // gắn payload vào request để dùng ở controller
    next()
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired access token' })
  }
}
