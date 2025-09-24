import express from 'express'
import { bookingController } from '../controller/booking.controller'
import { bookingValidation } from '../validation/booking.validation'

const Router = express.Router()

// Base route: /api/bookings
Router.route('/')
  // Create new booking
  .post(bookingValidation.createBooking, bookingController.createBooking)
  // Get all bookings
  .get(bookingController.getAllBookings)

// Route for specific booking by ID: /api/bookings/:id
Router.route('/:id')
  // Get booking by ID
  .get(bookingValidation.validateBookingId, bookingController.getBookingById)
  // Update booking by ID
  .put(bookingValidation.validateBookingId, bookingValidation.updateBooking, bookingController.updateBooking)
  // Delete booking by ID (hard delete)
  .delete(bookingValidation.validateBookingId, bookingController.deleteBooking)

// Route for user's bookings: /api/bookings/user/:userId
Router.route('/user/:userId').get(bookingController.getBookingsByUserId)

// Route for soft delete: /api/bookings/:id/soft-delete
Router.route('/:id/soft-delete').patch(
  bookingValidation.validateBookingId,
  bookingController.softDeleteBooking
)

// Route for cancel booking: /api/bookings/:id/cancel
Router.route('/:id/cancel').patch(bookingValidation.validateBookingId, bookingController.cancelBooking)

export const bookingRoute = Router
