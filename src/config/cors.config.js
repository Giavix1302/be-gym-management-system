import cors from 'cors'
import { env } from './environment.config.js'

const ENV = env.NODE_ENV || 'development'

const corsOptions = {
  origin: '*', // default
}

// Tuỳ biến theo môi trường
if (ENV === 'production') {
  corsOptions.origin = []
  corsOptions.methods = ['GET', 'POST', 'PUT', 'DELETE']
} else if (ENV === 'development') {
  corsOptions.origin = '*'
  corsOptions.methods = ['GET', 'POST', 'PUT', 'DELETE']
}

export default cors(corsOptions)