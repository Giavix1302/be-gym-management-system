import { roomModel } from '../model/room.model'
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
    const createdroom = await roomModel.createNew(newData)
    const getNewroom = await roomModel.getDetail(createdroom.insertedId)
    return {
      success: true,
      message: 'room created successfully',
      room: {
        ...sanitize(getNewroom),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await roomModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (roomId, data) => {
  try {
    // check existing user
    const existingroom = await roomModel.getDetailById(roomId)
    if (existingroom === null) {
      return {
        success: false,
        message: 'room not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await roomModel.updateInfo(roomId, updateData)

    // update s
    return {
      success: true,
      message: 'room updated successfully',
      room: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteRoom = async (roomId) => {
  try {
    // tim room có tồn tài không

    // xóa room
    const result = await roomModel.deleteRoom(roomId)
    return {
      success: true,
      message: 'room deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const roomService = {
  createNew,
  getDetail,
  updateInfo,
  deleteRoom,
}
