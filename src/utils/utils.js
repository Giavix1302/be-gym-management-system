export const sanitize = (data) => {
  if (!data) return null

  // loại bỏ các field không mong muốn
  const { createdAt, updatedAt, _destroy, password, ...safeData } = data

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
