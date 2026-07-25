import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true })

wishlistSchema.index({ sessionId: 1 })

export default mongoose.model('Wishlist', wishlistSchema)
