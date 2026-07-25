import mongoose from 'mongoose'

// Singleton document — one row holds all storefront/business configuration.
const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'WallSticks' },
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
  sizePrices: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      A5: 259,
      A4: 319,
      A3: 399,
      '12x18': 499,
      '18x24': 699,
      '24x36': 997,
    },
  },
}, { timestamps: true })

export default mongoose.model('Settings', settingsSchema)
