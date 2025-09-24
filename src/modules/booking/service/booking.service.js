import { bookingModel } from '../model/booking.model'
import { userModel } from '~/modules/user/model/user.model'
// Import schedule and location models based on your project structure
// import { scheduleModel } from '~/modules/schedule/model/schedule.model'
// import { locationModel } from '~/modules/location/model/location.model'
import { BOOKING_STATUS } from '~/utils/constants.js'
import { sanitize } from '~/utils/utils'

const createBooking = async (data) => {
  try {
    const { userId, scheduleId, locationId, price, note } = data

    // Validate user exists
    const isUserExist = await userModel.getDetailById(userId)
    console.log('🚀 ~ createBooking ~ isUserExist:', isUserExist)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    // Uncomment these validations when you have schedule and location models
    // const isScheduleExist = await scheduleModel.getDetailById(scheduleId)
    // console.log('🚀 ~ createBooking ~ isScheduleExist:', isScheduleExist)
    // if (isScheduleExist === null) return { success: false, message: 'Schedule not found' }

    // const isLocationExist = await locationModel.getDetailById(locationId)
    // console.log('🚀 ~ createBooking ~ isLocationExist:', isLocationExist)
    // if (isLocationExist === null) return { success: false, message: 'Location not found' }

    const dataToSave = {
      userId,
      scheduleId,
      locationId,
      status: BOOKING_STATUS.PENDING,
      price,
      note: note || '',
    }

    const result = await bookingModel.createNew(dataToSave)

    return {
      success: true,
      message: 'Booking created successfully',
      bookingId: result.insertedId,
    }
  } catch (error) {
    throw new Error(error)
  }
}

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

    return {
      success: true,
      message: 'Booking updated successfully',
      booking: sanitize(result),
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

    return {
      success: true,
      message: 'Booking cancelled successfully',
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
  updateBooking,
  deleteBooking,
  softDeleteBooking,
  cancelBooking,
}
