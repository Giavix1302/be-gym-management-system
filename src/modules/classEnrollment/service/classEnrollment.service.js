import { classEnrollmentModel } from '../model/classEnrollment.model'

const addClassEnrollment = async (data) => {
  try {
    const enrollmentToAdd = {
      ...data,
      enrolledAt: data.enrolledAt || new Date().toISOString(),
    }

    console.log('🚀 ~ addClassEnrollment ~ enrollmentToAdd:', enrollmentToAdd)

    // Create class enrollment
    const result = await classEnrollmentModel.createNew(enrollmentToAdd)

    // Get the newly created enrollment
    const enrollment = await classEnrollmentModel.getDetailById(result.insertedId)

    return {
      success: true,
      message: 'Class enrollment created successfully',
      enrollment: enrollment,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListClassEnrollment = async () => {
  try {
    const list = await classEnrollmentModel.getListWithQuantityUser()

    const arr = Object.values(list)
    console.log('🚀 ~ getListClassEnrollment ~ arr:', arr)

    return {
      success: true,
      message: 'Get list class enrollment successfully',
      enrollments: arr,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateClassEnrollment = async (req) => {
  try {
    const enrollmentId = req.params.id

    const updateData = {
      ...req.body,
      updatedAt: Date.now(),
    }

    console.log('🚀 ~ updateClassEnrollment ~ updateData:', updateData)

    const updatedEnrollment = await classEnrollmentModel.updateInfo(enrollmentId, updateData)

    // Check if enrollment exists
    if (updatedEnrollment === null) {
      return {
        success: false,
        message: 'Class enrollment does not exist.',
      }
    }

    return {
      success: true,
      message: 'Class enrollment updated successfully',
      updatedEnrollment,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteClassEnrollment = async (enrollmentId) => {
  try {
    const result = await classEnrollmentModel.deleteMembership(enrollmentId)

    return {
      success: result === 1,
      message: result === 1 ? 'Delete done!' : 'Delete failed!',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const classEnrollmentService = {
  addClassEnrollment,
  getListClassEnrollment,
  updateClassEnrollment,
  deleteClassEnrollment,
}
