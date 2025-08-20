import { createClient } from 'redis'
import { env } from '~/config/environment.config.js'

const redisCloud = createClient({
  username: 'default',
  password: env.REDIS_PASSWORD,
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
})

export const initRedis = async () => {
  if (!redisCloud.isOpen) {
    await redisCloud.connect()
  }
}

redisCloud.on('error', (err) => {
  console.error('❌ Redis error:', err)
})

export const saveUserTemp = async (phone, userData) => {
  await redisCloud.set(`user:${phone}`, JSON.stringify(userData), {
    EX: 300, // 300 giây = 5 phút
  })
}

export const getUserTemp = async (phone) => {
  const data = await redisCloud.get(`user:${phone}`)
  return data ? JSON.parse(data) : null
}

export default redisCloud
