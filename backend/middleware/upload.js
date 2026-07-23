import multer from 'multer'
import { posterStorage, paymentStorage, customUploadStorage } from '../config/cloudinary.js'

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true)
  else cb(new Error('Only image files are allowed'), false)
}

// In the test suite we don't want real network calls to Cloudinary, so uploads
// are kept in memory instead — route logic (validation, DB writes) is what's under test.
const isTest = process.env.NODE_ENV === 'test'
const memory = multer.memoryStorage()

export const uploadPosterImages = multer({ storage: isTest ? memory : posterStorage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })
export const uploadPaymentScreenshot = multer({ storage: isTest ? memory : paymentStorage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
export const uploadCustomImage = multer({ storage: isTest ? memory : customUploadStorage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } })
