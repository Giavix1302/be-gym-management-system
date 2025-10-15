console.log('========================================')
console.log('🔧 CORS CONFIG FILE IS BEING LOADED')
console.log('========================================')

import cors from 'cors'
import { env } from './environment.config.js'

const ENV = process.env.NODE_ENV || 'development'

console.log('🚀 ~ ENV:', ENV)
console.log('🌐 ~ FE_URL:', env.FE_URL)

let corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}

if (ENV === 'production') {
  corsOptions.origin = [env.FE_URL]
  console.log('✅ Production CORS - Allowed origins:', corsOptions.origin)
} else {
  // Development mode - allow both localhost AND ngrok URLs
  corsOptions.origin = function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      env.FE_URL, // Your ngrok frontend URL
    ]

    // Also allow any ngrok URL in development
    if (origin.includes('ngrok-free.app') || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
  console.log('✅ Development CORS - Allowing localhost and all ngrok URLs')
}

console.log('📋 Final CORS options:', JSON.stringify(corsOptions, null, 2))

export default cors(corsOptions)
