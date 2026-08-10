import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  customImage: { url: String, publicId: String },
  isCustom: { type: Boolean, default: false },
  size: String,
  finish: String,
  border: String,
  borderColor: String,
  orientation: String,
  quantity: { type: Number, default: 1, min: 1 },
  notes: String,
  priceAtAdd: Number,
}, { _id: false })

const cartSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true }, // guest-cart friendly, no forced login
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [cartItemSchema],
}, { timestamps: true })

export default mongoose.model('Cart', cartSchema)
