import { scheduleModel } from '~/modules/schedule/model/schedule.model'
import { bookingModel } from '../model/booking.model'
import { userModel } from '~/modules/user/model/user.model'
import { conversationModel } from '~/modules/conversation/model/conversation.model'
import { socketService } from '~/utils/socket.service'
import { BOOKING_STATUS } from '~/utils/constants.js'
import { sanitize } from '~/utils/utils'
import { locationModel } from '~/modules/location/model/location.model'

const createBooking = async (data) => {
  try {
    const { userId, scheduleId, locationId, price, note, title } = data

    // Validate user exists
    const isUserExist = await userModel.getDetailById(userId)
    console.log('🚀 ~ createBooking ~ isUserExist:', isUserExist)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    const isScheduleExist = await scheduleModel.getDetailById(scheduleId)
    console.log('🚀 ~ createBooking ~ isScheduleExist:', isScheduleExist)
    if (isScheduleExist === null) return { success: false, message: 'Schedule not found' }

    const isLocationExist = await locationModel.getDetailById(locationId)
    console.log('🚀 ~ createBooking ~ isLocationExist:', isLocationExist)
    if (isLocationExist === null) return { success: false, message: 'Location not found' }

    const conflict = await bookingModel.checkUserBookingConflict(userId, scheduleId)

    if (conflict) {
      return {
        success: false,
        message: `User already has a booking from ${conflict.startTime} to ${conflict.endTime}`,
      }
    }

    const dataToSave = {
      userId,
      scheduleId,
      locationId,
      title,
      status: BOOKING_STATUS.PENDING,
      price,
      note: note || '',
    }

    const result = await bookingModel.createNew(dataToSave)
    const bookingId = result.insertedId

    // Get trainer ID from schedule
    const trainerId = isScheduleExist.trainerId.toString()
    const userIdStr = userId.toString()
    const bookingIdStr = bookingId.toString()

    try {
      // Check if conversation already exists between user and trainer
      const existingConversation = await conversationModel.findByUserAndTrainer(userId, trainerId)

      if (!existingConversation) {
        // Create new conversation
        const conversationData = {
          userId: userIdStr,
          trainerId: trainerId,
          firstBookingId: bookingIdStr,
        }

        const conversationResult = await conversationModel.createNew(conversationData)
        const createdConversation = await conversationModel.getDetailById(conversationResult.insertedId)

        console.log('🚀 ~ Conversation created for booking:', bookingId)

        // Get trainer info for notifications
        const trainerInfo = await userModel.getDetailById(trainerId)

        // Notify both user and trainer about new conversation via Socket.IO
        if (socketService.isUserOnline(userId)) {
          socketService.sendToUser(userId, 'new_conversation', {
            conversation: sanitize(createdConversation),
            participant: sanitize(trainerInfo),
            message: `Cuộc hội thoại với ${trainerInfo.fullName} đã được tạo cho booking mới`,
          })
        }

        if (socketService.isUserOnline(trainerId)) {
          socketService.sendToUser(trainerId, 'new_conversation', {
            conversation: sanitize(createdConversation),
            participant: sanitize(isUserExist),
            message: `Bạn có booking mới từ ${isUserExist.fullName}`,
          })
        }

        // Send booking notification to trainer
        if (socketService.isUserOnline(trainerId)) {
          socketService.sendToUser(trainerId, 'new_booking', {
            bookingId,
            user: sanitize(isUserExist),
            schedule: sanitize(isScheduleExist),
            location: sanitize(isLocationExist),
            title,
            price,
            note,
            message: `Bạn có booking mới từ ${isUserExist.fullName}`,
          })
        }
      } else {
        console.log('🚀 ~ Conversation already exists between user and trainer')

        // Send booking notification to trainer even if conversation exists
        if (socketService.isUserOnline(trainerId)) {
          socketService.sendToUser(trainerId, 'new_booking', {
            bookingId,
            user: sanitize(isUserExist),
            schedule: sanitize(isScheduleExist),
            location: sanitize(isLocationExist),
            title,
            price,
            note,
            conversationId: existingConversation._id,
            message: `Bạn có booking mới từ ${isUserExist.fullName}`,
          })
        }
      }
    } catch (conversationError) {
      console.log('⚠️ ~ Failed to create conversation or send notification:', conversationError.message)
      // Don't fail the booking creation if conversation creation fails
    }

    return {
      success: true,
      message: 'Booking created successfully',
      bookingId: bookingId,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateBooking = async (bookingId, data) => {
  try {
    // Check if booking exists
    const isBookingExist = await bookingModel.getDetailById(bookingId)
    console.log('🚀 ~ updateBooking ~ isBookingExist:', isBookingExist)
    if (isBookingExist === null) return { success: false, message: 'Booking not found' }

    const dataToUpdate = {
      ...data,
    }

    const result = await bookingModel.updateInfo(bookingId, dataToUpdate)
    console.log('🚀 ~ updateBooking ~ result:', result)

    // If status is updated, notify both user and trainer
    if (data.status) {
      try {
        const userId = isBookingExist.userId.toString()
        const scheduleInfo = await scheduleModel.getDetailById(isBookingExist.scheduleId)
        const trainerId = scheduleInfo.trainerId.toString()

        const statusMessages = {
          [BOOKING_STATUS.BOOKED]: 'Booking đã được xác nhận',
          [BOOKING_STATUS.COMPLETED]: 'Buổi tập đã hoàn thành',
          [BOOKING_STATUS.CANCELLED]: 'Booking đã bị hủy',
        }

        const message = statusMessages[data.status] || `Trạng thái booking đã thay đổi thành ${data.status}`

        // Notify user
        if (socketService.isUserOnline(userId)) {
          socketService.sendToUser(userId, 'booking_updated', {
            bookingId,
            status: data.status,
            message,
          })
        }

        // Notify trainer
        if (socketService.isUserOnline(trainerId)) {
          socketService.sendToUser(trainerId, 'booking_updated', {
            bookingId,
            status: data.status,
            message,
          })
        }
      } catch (notificationError) {
        console.log('⚠️ ~ Failed to send booking update notification:', notificationError.message)
      }
    }

    return {
      success: true,
      message: 'Booking updated successfully',
      booking: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const cancelBooking = async (bookingId) => {
  try {
    // Check if booking exists
    const isBookingExist = await bookingModel.getDetailById(bookingId)
    if (isBookingExist === null) return { success: false, message: 'Booking not found' }

    // Check if booking can be cancelled
    if (isBookingExist.status === BOOKING_STATUS.COMPLETED) {
      return { success: false, message: 'Cannot cancel completed booking' }
    }
    if (isBookingExist.status === BOOKING_STATUS.CANCELLED) {
      return { success: false, message: 'Booking is already cancelled' }
    }

    const dataToUpdate = {
      status: BOOKING_STATUS.CANCELLED,
    }

    const result = await bookingModel.updateInfo(bookingId, dataToUpdate)

    // Notify both user and trainer about cancellation
    try {
      const userId = isBookingExist.userId.toString()
      const scheduleInfo = await scheduleModel.getDetailById(isBookingExist.scheduleId)
      const trainerId = scheduleInfo.trainerId.toString()

      // Notify user
      if (socketService.isUserOnline(userId)) {
        socketService.sendToUser(userId, 'booking_cancelled', {
          bookingId,
          message: 'Booking đã bị hủy',
        })
      }

      // Notify trainer
      if (socketService.isUserOnline(trainerId)) {
        const userInfo = await userModel.getDetailById(userId)
        socketService.sendToUser(trainerId, 'booking_cancelled', {
          bookingId,
          user: sanitize(userInfo),
          message: `Booking từ ${userInfo.fullName} đã bị hủy`,
        })
      }
    } catch (notificationError) {
      console.log('⚠️ ~ Failed to send cancellation notification:', notificationError.message)
    }

    return {
      success: true,
      message: 'Booking cancelled successfully',
      booking: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

// Keep all other existing functions unchanged
const getBookingById = async (bookingId) => {
  try {
    const booking = await bookingModel.getDetailById(bookingId)
    console.log('🚀 ~ getBookingById ~ booking:', booking)

    if (booking === null) {
      return {
        success: false,
        message: 'Booking not found',
      }
    }

    return {
      success: true,
      message: 'Booking retrieved successfully',
      booking: sanitize(booking),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getBookingsByTrainerId = async (trainerId) => {
  try {
    const bookings = await bookingModel.getBookingsByTrainerId(trainerId)

    if (bookings === null) {
      return {
        success: false,
        message: 'Booking not found',
      }
    }

    return {
      success: true,
      message: 'Booking retrieved successfully',
      bookings,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getBookingsByUserId = async (userId) => {
  try {
    // Validate user exists
    const isUserExist = await userModel.getDetailById(userId)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    const bookings = await bookingModel.getBookingsByUserId(userId)
    console.log('🚀 ~ getBookingsByUserId ~ bookings:', bookings)

    return {
      success: true,
      message: 'User bookings retrieved successfully',
      bookings: bookings.map((booking) => sanitize(booking)),
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getUpcomingBookingsByUserId = async (userId) => {
  try {
    // Validate user exists
    const isUserExist = await userModel.getDetailById(userId)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    const bookings = await bookingModel.getUpcomingBookingsByUserId(userId)
    console.log('🚀 ~ getBookingsByUserId ~ bookings:', bookings)

    return {
      success: true,
      message: 'User bookings retrieved successfully',
      bookings,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getHistoryBookingsByUserId = async (userId) => {
  try {
    // Validate user exists
    const isUserExist = await userModel.getDetailById(userId)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    const bookings = await bookingModel.getHistoryBookingsByUserId(userId)
    console.log('🚀 ~ getBookingsByUserId ~ bookings:', bookings)

    return {
      success: true,
      message: 'User bookings retrieved successfully',
      bookings,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getAllBookings = async () => {
  try {
    const bookings = await bookingModel.getAllBookings()
    console.log('🚀 ~ getAllBookings ~ bookings count:', bookings.length)

    return {
      success: true,
      message: 'All bookings retrieved successfully',
      bookings: bookings.map((booking) => sanitize(booking)),
      total: bookings.length,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteBooking = async (bookingId) => {
  try {
    // Check if booking exists
    const isBookingExist = await bookingModel.getDetailById(bookingId)
    console.log('🚀 ~ deleteBooking ~ isBookingExist:', isBookingExist)
    if (isBookingExist === null) return { success: false, message: 'Booking not found' }

    const result = await bookingModel.deleteBooking(bookingId)
    console.log('🚀 ~ deleteBooking ~ result:', result)

    if (result === 0) {
      return {
        success: false,
        message: 'Failed to delete booking',
      }
    }

    return {
      success: true,
      message: 'Booking deleted successfully',
      deletedCount: result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const softDeleteBooking = async (bookingId) => {
  try {
    // Check if booking exists
    const isBookingExist = await bookingModel.getDetailById(bookingId)
    console.log('🚀 ~ softDeleteBooking ~ isBookingExist:', isBookingExist)
    if (isBookingExist === null) return { success: false, message: 'Booking not found' }

    const result = await bookingModel.softDeleteBooking(bookingId)
    console.log('🚀 ~ softDeleteBooking ~ result:', result)

    return {
      success: true,
      message: 'Booking soft deleted successfully',
      booking: sanitize(result),
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const bookingService = {
  createBooking,
  getBookingById,
  getBookingsByUserId,
  getAllBookings,
  getUpcomingBookingsByUserId,
  getHistoryBookingsByUserId,
  updateBooking,
  deleteBooking,
  softDeleteBooking,
  cancelBooking,
  getBookingsByTrainerId,
}
