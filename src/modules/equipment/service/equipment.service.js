import { sanitize } from '~/utils/utils'
import { equipmentModel } from '../model/equipment.model'

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
    const createdequipment = await equipmentModel.createNew(newData)
    const getNewequipment = await equipmentModel.getDetail(createdequipment.insertedId)
    return {
      success: true,
      message: 'equipment created successfully',
      equipment: {
        ...sanitize(getNewequipment),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await equipmentModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (equipmentId, data) => {
  try {
    // check existing user
    const existingequipment = await equipmentModel.getDetailById(equipmentId)
    if (existingequipment === null) {
      return {
        success: false,
        message: 'equipment not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await equipmentModel.updateInfo(equipmentId, updateData)

    // update s
    return {
      success: true,
      message: 'equipment updated successfully',
      equipment: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteEquipment = async (equipmentId) => {
  try {
    // tim equipment có tồn tài không

    // xóa equipment
    const result = await equipmentModel.deleteequipment(equipmentId)
    return {
      success: true,
      message: 'equipment deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const equipmentService = {
  createNew,
  getDetail,
  updateInfo,
  deleteEquipment,
}
