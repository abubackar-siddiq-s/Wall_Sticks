import mongoose from 'mongoose'

const wishlistSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.Mixed },
  products: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true })

export default mongoose.model('Wishlist', wishlistSchema)
