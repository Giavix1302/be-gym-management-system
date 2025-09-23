import { reviewModel } from '../model/review.model'
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
    const createdReview = await reviewModel.createNew(newData)
    const getNewReview = await reviewModel.getDetail(createdReview.insertedId)
    return {
      success: true,
      message: 'review created successfully',
      review: {
        ...sanitize(getNewReview),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getDetail = async (userId) => {
  try {
    const user = await reviewModel.getDetail(userId)
    return user
  } catch (error) {
    throw new Error(error)
  }
}

const updateInfo = async (reviewId, data) => {
  try {
    // check existing user
    const existingReview = await reviewModel.getDetailById(reviewId)
    if (existingReview === null) {
      return {
        success: false,
        message: 'review not found',
      }
    }
    const updateData = {
      ...data,
      updatedAt: Date.now(),
    }
    const result = await reviewModel.updateInfo(reviewId, updateData)

    // update s
    return {
      success: true,
      message: 'review updated successfully',
      review: {
        ...sanitize(result),
      },
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteReview = async (reviewId) => {
  try {
    // tim review có tồn tài không

    // xóa review
    const result = await reviewModel.deleteReview(reviewId)
    return {
      success: true,
      message: 'review deleted successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const reviewService = {
  createNew,
  getDetail,
  updateInfo,
  deleteReview,
}
