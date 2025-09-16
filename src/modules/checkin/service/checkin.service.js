import { checkinModel } from '../model/checkin.model'
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
    const createdcheckin = await checkinModel.createNew(newData)
    const getNewcheckin = await checkinModel.getDetail(createdcheckin.insertedId)
    return {
      success: true,
      message: 'checkin created successfully',
      checkin: {
        ...sanitize(getNewcheckin),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await checkinModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (checkinId, data) => {
  try {
    // check existing user
    const existingcheckin = await checkinModel.getDetailById(checkinId)
    if (existingcheckin === null) {
      return {
        success: false,
        message: 'checkin not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await checkinModel.updateInfo(checkinId, updateData)

    // update s
    return {
      success: true,
      message: 'checkin updated successfully',
      checkin: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteCheckin = async (checkinId) => {
  try {
    // tim checkin có tồn tài không

    // xóa checkin
    const result = await checkinModel.deleteCheckin(checkinId)
    return {
      success: true,
      message: 'checkin deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const checkinService = {
  createNew,
  getDetail,
  updateInfo,
  deleteCheckin,
}
