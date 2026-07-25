import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.Mixed, required: true },
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, default: '', trim: true },
  approved: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Review', reviewSchema)
