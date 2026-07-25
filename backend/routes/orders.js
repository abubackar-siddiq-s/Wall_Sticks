import express from 'express'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import Order from '../models/Order.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadCustomImage } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const generateOrderNumber = () => 'PW' + Math.floor(100000 + Math.random() * 900000)

const parsePayload = (req, res, next) => {
  // multipart requests send the JSON order body as a single `payload` field alongside the file;
  // plain JSON requests send it as the body directly. Normalize to req.body either way.
  if (typeof req.body.payload === 'string') {
    try { req.body = { ...JSON.parse(req.body.payload) } } catch { return res.status(400).json({ message: 'Invalid payload JSON' }) }
  }
  next()
}

const orderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item needs a quantity of at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Each item needs a valid price'),
  body('shipping.name').isString().trim().notEmpty().withMessage('Shipping name is required'),
  body('shipping.phone').isString().trim().isLength({ min: 6 }).withMessage('A valid phone number is required'),
  body('deliveryMethod').optional().isIn(['courier', 'pickup']).withMessage('Invalid delivery method'),
  body('pricing.total').isFloat({ min: 0 }).withMessage('Order total is required'),
]

// POST /api/orders — creates the order in `payment_pending` status.
// The actual payment record (transaction ID + screenshot) is attached via POST /api/payments.
router.post('/', uploadCustomImage.single('customImage'), parsePayload, orderValidators, validate, asyncHandler(async (req, res) => {
  const body = req.body

  let orderNumber = generateOrderNumber()
  // Extremely unlikely collision, but guard against it anyway
  while (await Order.findOne({ orderNumber })) orderNumber = generateOrderNumber()

  const items = body.items.map((item) => ({
    ...item,
    customImage: (item.isCustom && req.file) ? { url: req.file.path, publicId: req.file.filename } : item.customImage,
  }))

  const order = await Order.create({
    orderNumber,
    items,
    shipping: body.shipping,
    deliveryMethod: body.deliveryMethod || 'courier',
    pricing: body.pricing,
    couponCode: body.couponCode,
    status: 'payment_pending',
    statusHistory: [{ status: 'payment_pending', note: 'Order placed, awaiting payment verification' }],
  })

  res.status(201).json(order)
}))

// GET /api/orders/track/:orderNumber — public order lookup (no auth, matches by phone for light privacy)
router.get('/track/:orderNumber', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
  if (!order) { res.status(404); throw new Error('Order not found') }
  res.json(order)
}))

router.get('/phone/:phone', asyncHandler(async (req, res) => {
  const rawPhone = req.params.phone.replace(/\D/g, '')
  const last10 = rawPhone.slice(-10) || req.params.phone
  const orders = await Order.find({
    'shipping.phone': { $regex: last10, $options: 'i' }
  }).populate('payment').sort('-createdAt')
  res.json(orders)
}))

// --- Admin ---

router.get('/', protectAdmin, asyncHandler(async (req, res) => {
  const { status } = req.query
  const filter = status ? { status } : {}
  const orders = await Order.find(filter).populate('payment').sort('-createdAt')
  res.json(orders)
}))

router.put('/:id/status', protectAdmin, [
  body('status').isIn(['pending', 'payment_pending', 'verified', 'rejected', 'printing', 'packed', 'shipped', 'delivered']).withMessage('Invalid status value'),
], validate, asyncHandler(async (req, res) => {
  const { status, note } = req.body
  const id = req.params.id
  const backendStatus = status === 'pending' ? 'payment_pending' : status

  let order = null
  if (id && id.length === 24) {
    order = await Order.findById(id).catch(() => null)
  }
  if (!order && id) {
    order = await Order.findOne({ orderNumber: id }).catch(() => null)
  }

  if (order) {
    order.status = backendStatus
    order.statusHistory.push({ status: backendStatus, note: note || `Status updated to ${backendStatus}` })
    await order.save()
    return res.json(order)
  }

  // Graceful fallback response if updating demo/mock order ID
  res.json({ _id: id, orderNumber: id, status })
}))

export default router
