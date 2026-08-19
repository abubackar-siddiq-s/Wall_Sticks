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
  sizeDescriptions: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      A5: 'Small Compact Desk/Shelf Poster (5.8 x 8.3 in)',
      A4: 'Standard Frame Document Poster (8.3 x 11.7 in)',
      A3: 'Medium Wall Accent Poster (11.7 x 16.5 in)',
      '12x18': 'Large Classic Wall Frame Poster (12 x 18 in)',
      '18x24': 'Extra Large Gallery Wall Poster (18 x 24 in)',
      '24x36': 'Masterpiece Giant Wall Art Poster (24 x 36 in)',
    },
  },
}, { timestamps: true })

export default mongoose.model('Settings', settingsSchema)
