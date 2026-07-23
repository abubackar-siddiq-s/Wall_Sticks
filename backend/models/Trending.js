import mongoose from 'mongoose'

// Separate collection so admin can hand-curate homepage carousel order
// independent of the `trending` boolean flag on Product.
const trendingSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Trending', trendingSchema)
