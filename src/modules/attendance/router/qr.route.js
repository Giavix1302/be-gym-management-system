import express from 'express'

import { attendanceController } from '../controller/attendance.controller.js'
import { attendanceValidation } from '../validation/attendance.validation.js'

const Router = express.Router()

// NEW: Unified QR toggle - handles both checkin and checkout automatically
Router.post('/toggle', attendanceValidation.toggle, attendanceController.toggleAttendance)

// Legacy endpoints (kept for backward compatibility)
Router.post('/checkin', attendanceValidation.checkin, attendanceController.checkin)
Router.put('/checkout', attendanceValidation.checkout, attendanceController.checkout)

export const qrRoute = Router
