/* eslint-disable indent */
import { sanitize, updateImages } from '~/utils/utils'
import { trainerModel } from '../model/trainer.model'
import { userModel } from '~/modules/user/model/user.model'
import { deleteImageByUrl } from '~/config/cloudinary.config'
import { STATUS_TYPE } from '~/utils/constants'

const createNew = async (req) => {
  try {
    const imageFiles = req.files || [] // luôn là array
    const physiqueImages = imageFiles.map((file) => file.path) // lấy ra mảng path

    const dataToCreate = {
      ...req.body,
      userId: req.body.userId,
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

const getListTrainerForUser = async () => {
  try {
    // check trainer
    const listTrainerInfo = await trainerModel.getListTrainerForUser()
    console.log('🚀 ~ getListTrainerForUser ~ listTrainerInfo:', listTrainerInfo)

    return {
      success: true,
      message: 'List Trainer info got successfully',
      listTrainerInfo,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListTrainerForAdmin = async () => {
  try {
    // check trainer
    const listTrainerInfo = await trainerModel.getListTrainerForAdmin()
    console.log('🚀 ~ getListTrainerForUser ~ listTrainerInfo:', listTrainerInfo)

    return {
      success: true,
      message: 'List Trainer info got successfully',
      listTrainerInfo,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateIsApproved = async (trainerId, data) => {
  try {
    const dataToUpdate = {
      isApproved: data.isApproved,
      approvedAt: data.isApproved ? new Date().toISOString() : '',
    }
    // check trainer
    const trainerInfo = await trainerModel.updateInfo(trainerId, dataToUpdate)

    if (trainerInfo) await userModel.updateInfo(trainerInfo.userId, { status: STATUS_TYPE.ACTIVE })

    return {
      success: true,
      message: 'Trainer updated successfully',
      trainerInfo,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (userId, req) => {
  try {
    const body = req.body || {}

    // Tách physiqueImages (links cũ muốn giữ) và các field khác
    const { physiqueImages: physiqueImagesKeep, ...rest } = body

    // File upload mới từ form-data (tên field: physiqueImagesNew)
    const imageFiles = req.files || []
    const physiqueImagesNew = imageFiles.map((file) => file.path)

    console.log('🚀 ~ updateInfo ~ physiqueImagesKeep:', physiqueImagesKeep)
    console.log('🚀 ~ updateInfo ~ physiqueImagesNew:', physiqueImagesNew)

    // Kiểm tra existing trainer
    const existingTrainer = await trainerModel.getDetailByUserId(userId)

    if (!existingTrainer) {
      // Tạo mới nếu chưa có trainer info
      const dataToCreate = {
        ...rest,
        userId,
        physiqueImages: physiqueImagesNew, // Chỉ có ảnh mới
      }

      const result = await trainerModel.createNew(dataToCreate)
      const getNewTrainer = await trainerModel.getDetailById(result.insertedId)

      return {
        success: true,
        message: 'trainer info created successfully',
        trainer: {
          ...sanitize(getNewTrainer),
        },
      }
    }

    // Lấy thông tin hiện tại
    const { physiqueImages: physiqueImagesInDatabase, _id: trainerId } = existingTrainer

    // Chuẩn hóa dữ liệu đầu vào
    const physiqueImagesHold = Array.isArray(physiqueImagesKeep)
      ? physiqueImagesKeep
      : physiqueImagesKeep
      ? [physiqueImagesKeep]
      : []

    let updateData = {
      ...rest,
      updatedAt: Date.now(),
    }

    let imageUpdated = null

    // Kiểm tra xem có phải trường hợp "Giữ nguyên" không
    const isKeepAll =
      physiqueImagesHold.length === physiqueImagesInDatabase.length &&
      physiqueImagesHold.every((img) => physiqueImagesInDatabase.includes(img)) &&
      physiqueImagesNew.length === 0

    if (isKeepAll) {
      /**
       * CASE: Giữ nguyên - physiqueImagesHold giống hệt physiqueImagesInDatabase
       * Không cập nhật field physiqueImages để tránh trigger không cần thiết
       */
      console.log('📸 Keep all current images - no changes needed')
    } else {
      /**
       * CASE: Có thay đổi về ảnh - sử dụng helper function updateImages
       * - physiqueImagesHold: ảnh cũ muốn giữ lại
       * - physiqueImagesNew: ảnh mới upload
       * - physiqueImagesInDatabase: ảnh hiện tại trong DB
       */
      imageUpdated = updateImages(
        physiqueImagesHold, // imageURL: ảnh cũ giữ lại
        physiqueImagesNew, // imageFile: ảnh mới
        physiqueImagesInDatabase // imageURLDatabase: ảnh trong DB
      )

      updateData.physiqueImages = imageUpdated.finalImage

      console.log('📸 Image update summary:')
      console.log(`  - Current in DB: ${physiqueImagesInDatabase.length} images`)
      console.log(`  - Keep from old: ${physiqueImagesHold.length} images`)
      console.log(`  - New uploaded: ${physiqueImagesNew.length} images`)
      console.log(`  - Final result: ${imageUpdated.finalImage.length} images`)
      console.log(`  - To remove: ${imageUpdated.removeImage.length} images`)
    }

    // Cập nhật trainer info
    const result = await trainerModel.updateInfo(trainerId, updateData)
    console.log('🚀 ~ updateInfo ~ updateData:', updateData)

    // Xóa ảnh cũ trên Cloudinary nếu cần
    if (imageUpdated && imageUpdated.removeImage.length > 0) {
      console.log('🗑️ Deleting removed images from Cloudinary:', imageUpdated.removeImage)
      for (const img of imageUpdated.removeImage) {
        try {
          await deleteImageByUrl(img)
          console.log(`✅ Deleted: ${img}`)
        } catch (error) {
          console.error(`❌ Failed to delete: ${img}`, error)
        }
      }
    }

    // Lấy trainer info sau khi update để trả về
    const updatedTrainer = await trainerModel.getDetailById(trainerId)

    return {
      success: true,
      message: 'trainer info updated successfully',
      trainer: {
        ...sanitize(updatedTrainer),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const trainerService = {
  createNew,
  getDetailByUserId,
  getListTrainerForUser,
  getListTrainerForAdmin,
  updateInfo,
  updateIsApproved,
}
