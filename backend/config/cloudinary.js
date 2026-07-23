import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Custom storage engine to stream uploads directly to Cloudinary
const createCloudinaryStorage = (folder) => ({
  _handleFile: (req, file, cb) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) return cb(error)
        cb(null, {
          path: result.secure_url,
          filename: result.public_id,
        })
      }
    )
    file.stream.pipe(uploadStream)
  },
  _removeFile: (req, file, cb) => {
    cloudinary.uploader.destroy(file.filename, cb)
  },
})

export const posterStorage = createCloudinaryStorage('posterwall/products')
export const paymentStorage = createCloudinaryStorage('posterwall/payments')
export const customUploadStorage = createCloudinaryStorage('posterwall/custom-uploads')

export default cloudinary

