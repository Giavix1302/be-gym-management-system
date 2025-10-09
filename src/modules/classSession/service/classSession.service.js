import { classSessionModel } from '../model/classSession.model'

const addClassSession = async (req) => {
  try {
    const sessionToAdd = {
      ...req.body,
    }

    console.log('🚀 ~ addClassSession ~ sessionToAdd:', sessionToAdd)

    // Create class session
    const result = await classSessionModel.createNew(sessionToAdd)

    // Get the newly created session
    const session = await classSessionModel.getDetailById(result.insertedId)

    return {
      success: true,
      message: 'Class session created successfully',
      session: session,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListClassSession = async () => {
  try {
    const list = await classSessionModel.getListWithQuantityUser()

    const arr = Object.values(list)
    console.log('🚀 ~ getListClassSession ~ arr:', arr)

    return {
      success: true,
      message: 'Get list class session successfully',
      sessions: arr,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateClassSession = async (req) => {
  try {
    const sessionId = req.params.id

    const updateData = {
      ...req.body,
      updatedAt: Date.now(),
    }

    console.log('🚀 ~ updateClassSession ~ updateData:', updateData)

    const updatedSession = await classSessionModel.updateInfo(sessionId, updateData)

    // Check if session exists
    if (updatedSession === null) {
      return {
        success: false,
        message: 'Class session does not exist.',
      }
    }

    return {
      success: true,
      message: 'Class session updated successfully',
      updatedSession,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteClassSession = async (sessionId) => {
  try {
    const result = await classSessionModel.deleteMembership(sessionId)

    return {
      success: result === 1,
      message: result === 1 ? 'Delete done!' : 'Delete failed!',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const classSessionService = {
  addClassSession,
  getListClassSession,
  updateClassSession,
  deleteClassSession,
}
