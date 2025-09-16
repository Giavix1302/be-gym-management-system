import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { env } from './environment.config.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gms-image', // tên thư mục trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
})

const extractPublicIdFromUrl = (url) => {
  // Lấy phần sau "/upload/"
  const parts = url.split('/upload/')
  if (parts.length < 2) return null

  // Bỏ version (vd: v1690000000)
  let publicIdWithExt = parts[1].replace(/^v[0-9]+\/+/, '')

  // Bỏ đuôi file (.jpg, .png, .webp,...)
  return publicIdWithExt.split('.')[0]
}

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result // { result: 'ok' } nếu xóa thành công
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}

export const deleteImageByUrl = async (url) => {
  const publicId = extractPublicIdFromUrl(url)
  if (!publicId) {
    throw new Error('Invalid Cloudinary URL')
  }
  return await deleteImage(publicId)
}

export const upload = multer({ storage })
