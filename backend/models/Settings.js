import mongoose from 'mongoose'

// Singleton document — one row holds all storefront/business configuration.
const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'PosterWall' },
  ownerName: String,
  phone: String,
  email: String,
  address: String,
  businessHours: String,
  instagram: String,
  whatsappChannelUrl: String,
  logo: { url: String, publicId: String },

  upiId: String,
  upiQr: { url: String, publicId: String },
  courierCharge: { type: Number, default: 79 },
  gstPercent: { type: Number, default: 0 },

  pickupAddress: String,
  pickupTime: String,
}, { timestamps: true })

export default mongoose.model('Settings', settingsSchema)
