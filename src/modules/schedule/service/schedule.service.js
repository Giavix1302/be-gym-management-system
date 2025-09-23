import { scheduleModel } from '../model/schedule.model'
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
    const createdSchedule = await scheduleModel.createNew(newData)
    const getNewSchedule = await scheduleModel.getDetail(createdSchedule.insertedId)
    return {
      success: true,
      message: 'schedule created successfully',
      schedule: {
        ...sanitize(getNewSchedule),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await scheduleModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (scheduleId, data) => {
  try {
    // check existing user
    const existingSchedule = await scheduleModel.getDetailById(scheduleId)
    if (existingSchedule === null) {
      return {
        success: false,
        message: 'schedule not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await scheduleModel.updateInfo(scheduleId, updateData)

    // update s
    return {
      success: true,
      message: 'schedule updated successfully',
      schedule: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteSchedule = async (scheduleId) => {
  try {
    // tim schedule có tồn tài không

    // xóa schedule
    const result = await scheduleModel.deleteSchedule(scheduleId)
    return {
      success: true,
      message: 'schedule deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const scheduleService = {
  createNew,
  getDetail,
  updateInfo,
  deleteSchedule,
}
