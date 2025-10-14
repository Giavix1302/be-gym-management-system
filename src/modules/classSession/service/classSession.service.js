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

    const classInfo = await classSessionModel.getDetailById(sessionId)

    const updateData = {
      ...req.body,

      updatedAt: Date.now(),
    }
    // update PT (kitrem tra khoản thời gian này pt có bị conflict không)

    // update room and schedule (kt xem khoảng time của lớp đó có conflict không)

    // update schedule (kt xem khoảng time của lớp đó có conflict không)

    // update room ( kt xem khoảng time của lớp đó có conflict không)

    // check schedule conflict room

    const arrTrainers = Array.isArray(updateData.trainers) ? updateData.trainers : []

    if (arrTrainers.length > 0) {
      // Check each trainer individually for conflicts
      for (const trainerId of arrTrainers) {
        // Check if this trainer exists in the class and has no schedule conflicts
        const conflictPt = await classSessionModel.checkPTScheduleConflict(
          trainerId,
          updateData.startTime,
          updateData.endTime,
          classInfo.classId
        )

        if (conflictPt.hasConflict) {
          // Return detailed error based on conflict type
          if (conflictPt.typeError === 'trainer_not_assigned') {
            return {
              success: false,
              message: conflictPt.message,
              trainerId: trainerId,
              trainerName: conflictPt.trainerName,
            }
          } else if (conflictPt.typeError === 'schedule_conflict') {
            return {
              success: false,
              message: conflictPt.message,
              trainerId: trainerId,
              trainerName: conflictPt.trainerInfo.name,
              conflicts: conflictPt.conflicts,
            }
          } else {
            return {
              success: false,
              message: conflictPt.message,
            }
          }
        }
      }
    }

    if (updateData.roomId) {
      //
      const conflictRoom = await classSessionModel.checkRoomScheduleConflict(
        sessionId,
        updateData.startTime,
        updateData.endTime,
        updateData.roomId
      )
      if (conflictRoom.hasConflict) {
        let messageError = `Conflict found: ${conflictRoom.message}`
        conflictRoom.conflicts.forEach((conflict) => {
          messageError += ` - ${conflict.className} at ${conflict.startTime}`
        })
        return { success: false, message: messageError }
      }
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
