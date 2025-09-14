import cors from 'cors'
import { env } from './environment.config.js'

const ENV = env.NODE_ENV || 'development'

let corsOptions = {
  credentials: true, // cho phép gửi cookie
}

if (ENV === 'production') {
  corsOptions = {
    origin: [env.FE_URL], // domain FE thật
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
} else if (ENV === 'development') {
  corsOptions = {
    origin: 'http://localhost:5173', // domain FE dev
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
}

export default cors(corsOptions)
