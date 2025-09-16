import { bookingModel } from '../model/booking.model'
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
    const createdbooking = await bookingModel.createNew(newData)
    const getNewbooking = await bookingModel.getDetail(createdbooking.insertedId)
    return {
      success: true,
      message: 'booking created successfully',
      booking: {
        ...sanitize(getNewbooking),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await bookingModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (bookingId, data) => {
  try {
    // check existing user
    const existingbooking = await bookingModel.getDetailById(bookingId)
    if (existingbooking === null) {
      return {
        success: false,
        message: 'booking not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await bookingModel.updateInfo(bookingId, updateData)

    // update s
    return {
      success: true,
      message: 'booking updated successfully',
      booking: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBooking = async (bookingId) => {
  try {
    // tim booking có tồn tài không

    // xóa booking
    const result = await bookingModel.deleteBooking(bookingId)
    return {
      success: true,
      message: 'booking deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingService = {
  createNew,
  getDetail,
  updateInfo,
  deleteBooking,
}
