import { classModel } from '../model/class.model'
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
    const createdclass = await classModel.createNew(newData)
    const getNewclass = await classModel.getDetail(createdclass.insertedId)
    return {
      success: true,
      message: 'class created successfully',
      class: {
        ...sanitize(getNewclass),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await classModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (classId, data) => {
  try {
    // check existing user
    const existingclass = await classModel.getDetailById(classId)
    if (existingclass === null) {
      return {
        success: false,
        message: 'class not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await classModel.updateInfo(classId, updateData)

    // update s
    return {
      success: true,
      message: 'class updated successfully',
      class: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteClass = async (classId) => {
  try {
    // tim class có tồn tài không

    // xóa class
    const result = await classModel.deleteClass(classId)
    return {
      success: true,
      message: 'class deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const classService = {
  createNew,
  getDetail,
  updateInfo,
  deleteClass,
}
