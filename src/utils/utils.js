export const sanitize = (data) => {
  if (!data) return null

  // loại bỏ các field không mong muốn
  const { createdAt, updatedAt, _destroy, password, ...safeData } = data

  return safeData
}
