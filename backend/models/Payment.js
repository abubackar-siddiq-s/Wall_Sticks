import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  name: String,
  phone: String,
  transactionId: { type: String, required: true },
  screenshot: { url: String, publicId: String },
  notes: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  verifiedAt: Date,
}, { timestamps: true })

export default mongoose.model('Payment', paymentSchema)
