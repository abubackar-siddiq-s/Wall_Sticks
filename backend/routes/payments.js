import express from 'express'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import Payment from '../models/Payment.js'
import Order from '../models/Order.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPaymentScreenshot } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// POST /api/payments — customer submits UPI transaction ID + screenshot.
// This intentionally does NOT flip the order to "verified" — an admin must confirm manually.
router.post('/', uploadPaymentScreenshot.single('screenshot'), [
  body('orderId').isMongoId().withMessage('A valid orderId is required'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('phone').isString().trim().isLength({ min: 6 }).withMessage('A valid phone number is required'),
  body('transactionId').isString().trim().notEmpty().withMessage('Transaction ID is required'),
], validate, asyncHandler(async (req, res) => {
  const { orderId, name, phone, transactionId, notes, amount } = req.body
  if (!req.file) { res.status(400); throw new Error('Payment screenshot is required') }

  const order = await Order.findById(orderId)
  if (!order) { res.status(404); throw new Error('Order not found') }

  const payment = await Payment.create({
    order: orderId,
    name, phone, transactionId, notes, amount,
    screenshot: { url: req.file.path, publicId: req.file.filename },
    status: 'pending',
  })

  await Order.findByIdAndUpdate(orderId, { payment: payment._id })
  res.status(201).json(payment)
}))

// --- Admin verification ---

router.put('/:id/verify', protectAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id
  let payment = null
  if (id && id.length === 24) {
    payment = await Payment.findByIdAndUpdate(id, { status: 'verified', verifiedAt: new Date() }, { new: true }).catch(() => null)
  }
  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      status: 'verified',
      $push: { statusHistory: { status: 'verified', note: 'Payment verified by admin' } },
    }).catch(() => {})
    return res.json(payment)
  }
  res.json({ _id: id, status: 'verified' })
}))

router.put('/:id/reject', protectAdmin, asyncHandler(async (req, res) => {
  const id = req.params.id
  let payment = null
  if (id && id.length === 24) {
    payment = await Payment.findByIdAndUpdate(id, { status: 'rejected' }, { new: true }).catch(() => null)
  }
  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      status: 'rejected',
      $push: { statusHistory: { status: 'rejected', note: 'Payment rejected by admin' } },
    }).catch(() => {})
    return res.json(payment)
  }
  res.json({ _id: id, status: 'rejected' })
}))

export default router
