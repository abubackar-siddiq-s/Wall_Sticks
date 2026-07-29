import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  code: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto expires in 10 minutes (600s)
})

export default mongoose.model('Otp', otpSchema)
