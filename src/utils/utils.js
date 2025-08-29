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
