import { locationModel } from '../model/location.model'
import { sanitize } from '~/utils/utils'

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
    const createdLocation = await locationModel.createNew(newData)
    const getNewLocation = await locationModel.getDetail(createdLocation.insertedId)

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

const getListLocation = async (userId) => {
  try {
    const listLocation = await locationModel.getListLocation(userId)
    console.log('🚀 ~ getListLocation ~ listLocation:', listLocation)
    return {
      success: true,
      message: 'Location created successfully',
      locations: listLocation.map((location) => sanitize(location)),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (locationId, data) => {
  try {
    // check existing user
    const existingLocation = await locationModel.getDetailById(locationId)
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
    const result = await locationModel.updateInfo(locationId, updateData)

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
    const result = await locationModel.deleteLocation(locationId)
    return {
      success: true,
      message: 'Location deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const locationService = {
  createNew,
  getListLocation,
  updateInfo,
  deleteLocation,
}
