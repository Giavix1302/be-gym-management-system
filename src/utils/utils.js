export const sanitize = (data, fieldsToRemove = []) => {
  if (!data) return null

  // mặc định luôn bỏ mấy field nhạy cảm
  const defaultFields = ['createdAt', 'updatedAt', '_destroy', 'password']

  // gộp cả default và custom
  const fields = new Set([...defaultFields, ...fieldsToRemove])

  // loại bỏ field không mong muốn
  const safeData = Object.keys(data).reduce((acc, key) => {
    if (!fields.has(key)) {
      acc[key] = data[key]
    }
    return acc
  }, {})

  return safeData
}

export const convertVnpayDateToISO = (vnp_PayDate) => {
  if (!vnp_PayDate || vnp_PayDate.length !== 14) {
    throw new Error('Invalid vnp_PayDate format')
  }

  const year = vnp_PayDate.substring(0, 4)
  const month = vnp_PayDate.substring(4, 6)
  const day = vnp_PayDate.substring(6, 8)
  const hour = vnp_PayDate.substring(8, 10)
  const minute = vnp_PayDate.substring(10, 12)
  const second = vnp_PayDate.substring(12, 14)

  // Tạo đối tượng Date
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)

  return date.toISOString() // Trả về ISO 8601
}

export function calculateEndDate(startDateISO, monthsToAdd) {
  const startDate = new Date(startDateISO)

  // Thêm số tháng
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + monthsToAdd)

  // Trả về theo chuẩn ISO
  return endDate.toISOString()
}

export function countRemainingDays(endISO) {
  const now = new Date()
  const end = new Date(endISO)

  const diffMs = end.getTime() - now.getTime()

  if (diffMs <= 0) return 0

  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function calculateDiscountedPrice(originalPrice, discountPercent) {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount must be between 0 and 100')
  }

  const discountAmount = (originalPrice * discountPercent) / 100
  const finalPrice = originalPrice - discountAmount

  return {
    originalPrice,
    discountPercent,
    discountAmount,
    finalPrice,
  }
}

export const createRedirectUrl = (paymentData, baseUrl, service) => {
  const params = new URLSearchParams()

  // Thêm tham số service đầu tiên
  params.append('service', service)

  // Thêm các tham số từ paymentData vào URLSearchParams
  Object.entries(paymentData).forEach(([key, value]) => {
    params.append(key, value)
  })

  // Nối query string vào baseUrl
  return `${baseUrl}${params.toString()}`
}

export function updateImages(imageURL = [], imageFile = [], imageURLDatabase = []) {
  const finalImage = [...imageURL, ...imageFile]
  const removeImage = imageURLDatabase.filter((img) => !finalImage.includes(img))
  return { finalImage, removeImage }
}

export function idFromTimestamp() {
  return Date.now().toString() + '-' + Math.random().toString(36).slice(2, 6)
}

export function isValidDateRange(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (isNaN(startDate) || isNaN(endDate)) {
    throw new Error('Ngày không hợp lệ')
  }

  return startDate < endDate
}

// Helper function to generate class sessions
// Helper function to generate class sessions
export const generateClassSessions = (classId, startDate, endDate, recurrenceArray, trainers, className) => {
  const sessions = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const now = new Date() // Current date and time

  // Iterate through each recurrence pattern
  recurrenceArray.forEach((recurrence) => {
    const { dayOfWeek, startTime, endTime, roomId } = recurrence

    // Find the first occurrence of the target day of week
    let currentDate = new Date(start)

    // Adjust to the first occurrence of the target day
    while (currentDate.getDay() !== dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Generate sessions for every week until end date
    while (currentDate <= end) {
      // Create session start and end datetime
      const sessionStart = new Date(currentDate)
      sessionStart.setHours(startTime.hour, startTime.minute, 0, 0)

      const sessionEnd = new Date(currentDate)
      sessionEnd.setHours(endTime.hour, endTime.minute, 0, 0)

      // Calculate hours (duration in hours)
      const durationMs = sessionEnd - sessionStart
      const hours = durationMs / (1000 * 60 * 60) // Convert milliseconds to hours

      // Only create session if it's in the future
      if (sessionStart > now) {
        sessions.push({
          classId: classId.toString(),
          trainers: trainers,
          users: [],
          roomId: roomId,
          startTime: sessionStart.toISOString(),
          endTime: sessionEnd.toISOString(),
          hours: hours, // Added hours field
          title: `${className} - ${getDayName(dayOfWeek)} ${formatTime(startTime)}-${formatTime(endTime)}`,
        })
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7)
    }
  })

  return sessions
}

// Helper function to get day name
export const getDayName = (dayOfWeek) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek]
}

// Helper function to format time
export const formatTime = (time) => {
  const hour = time.hour.toString().padStart(2, '0')
  const minute = time.minute.toString().padStart(2, '0')
  return `${hour}:${minute}`
}
