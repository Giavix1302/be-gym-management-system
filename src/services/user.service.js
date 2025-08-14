import { userModel } from '../models/user.model.js'

const createNew = async (reqBody) => {
  try {
    const createdUser = await userModel.createNew(reqBody)
    const getNewUser = await userModel.getDetail(createdUser.insertedId)
    return getNewUser
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await userModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

export const userService = {
  createNew,
  getDetail
}