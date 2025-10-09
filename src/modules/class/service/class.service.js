import { generateClassSessions, isValidDateRange } from '~/utils/utils'
import { classModel } from '../model/class.model'
import { classSessionModel } from '~/modules/classSession/model/classSession.model'

const addClass = async (req) => {
  try {
    // add location id
    const image = req.file

    const classToAdd = {
      ...req.body,
      image: image ? image.path : '',
      recurrence: JSON.parse(req.body.recurrence),
      trainers: JSON.parse(req.body.trainers),
    }

    console.log('🚀 ~ addClass ~ classToAdd:', classToAdd)

    // Check startDate > endDate
    if (!isValidDateRange(classToAdd.startDate, classToAdd.endDate))
      return { success: false, message: 'Start date must be earlier than end date.' }

    // Create class
    const result = await classModel.createNew(classToAdd)
    const classId = result.insertedId

    // Generate class sessions based on recurrence
    const sessions = generateClassSessions(
      classId,
      classToAdd.startDate,
      classToAdd.endDate,
      classToAdd.recurrence,
      classToAdd.trainers,
      classToAdd.name
    )

    // Create all class sessions
    const sessionPromises = sessions.map((session) => classSessionModel.createNew(session))
    await Promise.all(sessionPromises)

    // Get the newly created class with details
    const classDetail = await classModel.getDetailById(classId)

    return {
      success: true,
      message: `Class created successfully with ${sessions.length} session(s)`,
      class: classDetail,
      sessionsCreated: sessions.length,
    }
  } catch (error) {
    console.error('Error in addClass service:', error)
    throw new Error(error)
  }
}

const getListClasses = async () => {
  try {
    const list = await classModel.getListWithDetails()

    return {
      success: true,
      message: 'Get list classes successfully',
      classes: list,
      total: list.length,
    }
  } catch (error) {
    console.error('Error in getListClasses service:', error)
    throw new Error(error)
  }
}

const getListClassInfoForAdmin = async () => {
  try {
    const list = await classModel.getListClassInfoForAdmin()

    return {
      success: true,
      message: 'Get list classes successfully',
      classes: list,
      total: list.length,
    }
  } catch (error) {
    console.error('Error in getListClasses service:', error)
    throw new Error(error)
  }
}

const getListClassInfoForUser = async () => {
  try {
    const list = await classModel.getListClassInfoForUser()

    return {
      success: true,
      message: 'Get list classes successfully',
      classes: list,
    }
  } catch (error) {
    console.error('Error in getListClasses service:', error)
    throw new Error(error)
  }
}

const getClassDetail = async (classId) => {
  try {
    const classDetail = await classModel.getDetailById(classId)

    if (!classDetail) {
      return {
        success: false,
        message: 'Class not found',
      }
    }

    return {
      success: true,
      message: 'Get class detail successfully',
      class: classDetail,
    }
  } catch (error) {
    console.error('Error in getClassDetail service:', error)
    throw new Error(error)
  }
}

const updateClass = async (req) => {
  try {
    const classId = req.params.id
    const image = req.file
    const { trainers, recurrence, ...rest } = req.body

    const updateData = {
      ...rest,
      ...(image && { image: image.path }),
      ...(trainers && { trainers: JSON.parse(trainers) }),
      ...(recurrence && { recurrence: JSON.parse(recurrence) }),
      updatedAt: Date.now(),
    }

    console.log('🚀 ~ updateClass ~ updateData:', updateData)

    const updatedClass = await classModel.updateInfo(classId, updateData)

    if (updatedClass === null) {
      return {
        success: false,
        message: 'Class does not exist.',
      }
    }

    return {
      success: true,
      message: 'Class updated successfully',
      class: updatedClass,
    }
  } catch (error) {
    console.error('Error in updateClass service:', error)
    throw new Error(error)
  }
}

const deleteClass = async (classId) => {
  try {
    const result = await classModel.deleteClass(classId)

    return {
      success: result === 1,
      message: result === 1 ? 'Class deleted successfully!' : 'Delete failed!',
    }
  } catch (error) {
    console.error('Error in deleteClass service:', error)
    throw new Error(error)
  }
}

const getClassesByTrainer = async (trainerId) => {
  try {
    const classes = await classModel.getClassesByTrainer(trainerId)

    return {
      success: true,
      message: 'Get classes by trainer successfully',
      classes: classes,
      total: classes.length,
    }
  } catch (error) {
    console.error('Error in getClassesByTrainer service:', error)
    throw new Error(error)
  }
}

const getClassesByType = async (classType) => {
  try {
    const classes = await classModel.getClassesByType(classType)

    return {
      success: true,
      message: `Get ${classType} classes successfully`,
      classes: classes,
      total: classes.length,
    }
  } catch (error) {
    console.error('Error in getClassesByType service:', error)
    throw new Error(error)
  }
}

export const classService = {
  addClass,
  getListClasses,
  getClassDetail,
  updateClass,
  deleteClass,
  getClassesByTrainer,
  getClassesByType,
  getListClassInfoForAdmin,
  getListClassInfoForUser,
}
