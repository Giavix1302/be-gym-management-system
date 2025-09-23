import { userModel } from '~/modules/user/model/user.model.js'
import { sanitize } from '~/utils/utils'

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

const updateInfo = async (userId, data) => {
  try {
    // check existing user
    const existingUser = await userModel.getDetailById(userId)
    console.log('🚀 ~ update ~ existingUser:', existingUser)
    if (existingUser === null) {
      return {
        success: false,
        message: 'User not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await userModel.updateInfo(userId, updateData)
    console.log('🚀 ~ updateInfo ~ result:', result)

    // update user
    return {
      success: true,
      message: 'User updated successfully',
      user: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const userService = {
  createNew,
  getDetail,
  updateInfo,
}
