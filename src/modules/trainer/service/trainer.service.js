/* eslint-disable indent */
import { sanitize, updateImages } from '~/utils/utils'
import { trainerModel } from '../model/trainer.model'
import { userModel } from '~/modules/user/model/user.model'
import { deleteImageByUrl } from '~/config/cloudinary.config'

const createNew = async (req) => {
  try {
    const imageFiles = req.files || [] // luôn là array
    const physiqueImages = imageFiles.map((file) => file.path) // lấy ra mảng path

    const dataToCreate = {
      userId: req.body.userId,
      specialization: req.body.specialization,
      bio: req.body.bio,
      physiqueImages, // mảng link cloudinary
    }

    // check userId - neu có sang bước tiếp theo - khong có thì thông bao loi
    const existingUser = await userModel.getDetailById(dataToCreate.userId)
    if (!existingUser) return { success: false, message: 'User not found' }
    // data to create

    // create
    const createdTrainer = await trainerModel.createNew(dataToCreate)
    const getNewTrainer = await trainerModel.getDetailById(createdTrainer.insertedId)

    // return
    return {
      success: true,
      message: 'trainer info created successfully',
      trainer: {
        ...sanitize(getNewTrainer),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetailByUserId = async (userId) => {
  try {
    const existingUser = await userModel.getDetailById(userId)
    if (!existingUser) return { success: false, message: 'User not found' }

    // check trainer
    const existingTrainer = await trainerModel.getDetailByUserId(userId)
    console.log('🚀 ~ getDetailByUserId ~ existingTrainer:', existingTrainer)
    if (!existingTrainer) return { success: false, message: 'Trainer information not updated.' }

    return {
      success: true,
      message: 'Trainer info got successfully',
      trainer: {
        ...sanitize(existingTrainer),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (userId, req) => {
  try {
    // check existing user
    const existingTrainer = await trainerModel.getDetailByUserId(userId)
    if (!existingTrainer) return { success: false, message: 'Trainer information not updated.' }

    const { physiqueImages: physiqueImagesInDatabase, _id: trainerId } = existingTrainer
    //
    const imageFiles = req.files || [] // luôn là array
    const physiqueImagesNew = imageFiles.map((file) => file.path)

    const { physiqueImages: physiqueImagesHoldRaw, ...rest } = req.body
    const physiqueImagesHold = Array.isArray(physiqueImagesHoldRaw)
      ? physiqueImagesHoldRaw
      : physiqueImagesHoldRaw
      ? [physiqueImagesHoldRaw]
      : []

    let imageUpdated
    if (physiqueImagesNew.length !== 0) {
      imageUpdated = updateImages(physiqueImagesHold, physiqueImagesNew, physiqueImagesInDatabase)
    }

    const updateData = {
      ...rest,
      ...(physiqueImagesNew.length !== 0
        ? { physiqueImages: imageUpdated.finalImage }
        : { physiqueImages: physiqueImagesHold }),
      updatedAt: Date.now(),
    }

    const result = await trainerModel.updateInfo(trainerId, updateData)
    console.log('🚀 ~ updateInfo ~ result:', result)

    // xóa các hình trên cloundinay
    if (imageUpdated && imageUpdated.removeImage.length > 0) {
      for (const img of imageUpdated.removeImage) {
        await deleteImageByUrl(img)
      }
    }
    // update user
    return {
      success: true,
      message: 'trainer info updated successfully',
      trainer: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const trainerService = {
  createNew,
  getDetailByUserId,
  updateInfo,
}
