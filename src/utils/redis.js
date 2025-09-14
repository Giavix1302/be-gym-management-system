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

export const saveLinkPaymentTemp = async (subId, data) => {
  await redisCloud.set(`user:${subId}`, JSON.stringify(data), {
    EX: 10 * 60,
  })
}

export const getLinkPaymentTemp = async (subId) => {
  const data = await redisCloud.get(`user:${subId}`)
  return data ? JSON.parse(data) : null
}

export const deleteLinkPaymentTemp = async (subId) => {
  await redisCloud.del(`user:${subId}`)
}

export default redisCloud
