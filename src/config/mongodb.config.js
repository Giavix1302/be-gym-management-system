import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from './environment.config.js'
import { subscriptionModel } from '~/modules/subscription/model/subscription.model.js'

let gmsDatabaseInstance = null

const mongoClientInstance = new MongoClient(env.MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export const CONNECT_DB = async () => {
  await mongoClientInstance.connect()
  gmsDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)

  await subscriptionModel.createIndexes()
}

export const GET_DB = () => {
  if (!gmsDatabaseInstance) throw new Error('Must connect to database first')
  return gmsDatabaseInstance
}

export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}
