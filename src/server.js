import express from 'express'
import { createServer } from 'http'
import dotenv from 'dotenv'
import corsConfig from './config/cors.config.js'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middlewares/errorHandler.js'
import { APIs_V1 } from './routers/v1/index.js'
import { CONNECT_DB } from './config/mongodb.config.js'
import { initRedis } from '~/utils/redis.js'
import { env } from './config/environment.config.js'
import { socketService } from '~/utils/socket.service.js'

const START_APP = () => {
  // Đọc biến môi trường từ file .env
  dotenv.config()

  // Tạo ứng dụng Express
  const app = express()

  // Tạo HTTP server để có thể tích hợp Socket.IO
  const server = createServer(app)

  // Initialize Socket.IO
  socketService.init(server)
  console.log('📡 Socket.IO server initialized')

  // Middleware xử lý JSON body
  app.use(express.json())

  app.use(corsConfig)

  app.use(cookieParser())

  // router
  app.use('/v1', APIs_V1)

  // Socket.IO status endpoint
  app.get('/v1/socket/status', (req, res) => {
    res.json({
      success: true,
      onlineUsers: socketService.getOnlineUsersCount(),
      users: socketService.getOnlineUsers(),
    })
  })

  // Lấy PORT từ biến môi trường hoặc mặc định là 3000
  const PORT = process.env.PORT || 3000

  app.use(errorHandler)

  // Khởi động server với HTTP server thay vì app
  server.listen(PORT, () => {
    console.log('---------------- BE', env.BE_URL)
    console.log('---------------- FE', env.FE_URL)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🛠️ Dev server is running at http://localhost:${PORT}`)
    } else if (process.env.NODE_ENV === 'production') {
      console.log(`🚀 Production server is running on port ${PORT}`)
    } else {
      console.log(`✅ Server is running at http://localhost:${PORT} (env: ${process.env.NODE_ENV})`)
    }
  })

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('🛑 Server is shutting down...')
    server.close(() => {
      console.log('✅ Server closed')
      process.exit(0)
    })
  })
}

;(async () => {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await CONNECT_DB()
    console.log('Connected to MongoDB Atlas!')

    console.log('Connecting to Redis Cloud...')
    await initRedis()
    console.log('✅ Connected to Redis Cloud!')

    START_APP()
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas:', error)
    process.exit(0)
  }
})()
