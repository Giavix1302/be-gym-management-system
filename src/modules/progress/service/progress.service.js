import { sanitize } from '~/utils/utils'
import { progressModel } from '../model/progress.model'

const createNew = async (req) => {
  try {
    const imageFiles = req.files || [] // luôn là array
    const images = imageFiles.map((file) => file.path) // lấy ra mảng path

    // parse address vì form-data chỉ gửi string
    const address = JSON.parse(req.body.address)

    const newData = {
      name: req.body.name,
      phone: req.body.phone,
      address,
      images, // mảng link cloudinary
    }

    console.log('🚀 ~ createNew ~ newData:', newData)
    const createdLocation = await progressModel.createNew(newData)
    const getNewLocation = await progressModel.getDetail(createdLocation.insertedId)
    return {
      success: true,
      message: 'Location created successfully',
      location: {
        ...sanitize(getNewLocation),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await progressModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (locationId, data) => {
  try {
    // check existing user
    const existingLocation = await progressModel.getDetailById(locationId)
    if (existingLocation === null) {
      return {
        success: false,
        message: 'Location not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await progressModel.updateInfo(locationId, updateData)

    // update s
    return {
      success: true,
      message: 'Location updated successfully',
      location: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteLocation = async (locationId) => {
  try {
    // tim location có tồn tài không

    // xóa location
    const result = await progressModel.deleteLocation(locationId)
    return {
      success: true,
      message: 'Location deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const progressService = {
  createNew,
  getDetail,
  updateInfo,
  deleteLocation,
}
