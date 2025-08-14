import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.config.js'

let pcDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  pcDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

export const GET_DB = () => {
  if (!pcDatabaseInstance) throw new Error('Must connect to database first')
  return pcDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}