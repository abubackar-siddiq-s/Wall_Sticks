import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, default: 0 },
  images: [{ url: String, publicId: String }],
  sizes: { type: [String], default: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'] },
  finishes: { type: [String], default: ['Premium Matte', 'Gloss', 'Canvas', 'Framed'] },
  borders: { type: [String], default: ['White', 'Black', 'No Border'] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  stock: { type: Number, default: 999 },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },
  trendingOrder: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
  next()
})

productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1, active: 1 })
productSchema.index({ price: 1 })
productSchema.index({ trending: 1, active: 1 })
productSchema.index({ bestSeller: 1, active: 1 })
productSchema.index({ createdAt: -1 })

export default mongoose.model('Product', productSchema)
