import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String, // snapshot at time of order, so later product edits don't rewrite history
  customImage: { url: String, publicId: String },
  productImage: String,
  isCustom: { type: Boolean, default: false },
  size: String,
  finish: String,
  border: String,
  borderColor: String,
  orientation: String,
  quantity: Number,
  price: Number,
  notes: String,
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // e.g. PW482913
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [orderItemSchema],
  notes: String, // Order-level special instructions / notes

  shipping: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },
  deliveryMethod: { type: String, enum: ['courier', 'pickup'], default: 'courier' },

  pricing: {
    subtotal: Number,
    courierCharge: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number,
  },
  couponCode: String,

  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },

  status: {
    type: String,
    enum: ['payment_pending', 'verified', 'rejected', 'printing', 'packed', 'shipped', 'delivered'],
    default: 'payment_pending',
  },
  statusHistory: [{
    status: String,
    at: { type: Date, default: Date.now },
    note: String,
  }],
}, { timestamps: true })

orderSchema.index({ 'shipping.phone': 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

export default mongoose.model('Order', orderSchema)
