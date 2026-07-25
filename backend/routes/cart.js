import express from 'express'
import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'

const router = express.Router()

// Cart is keyed by a client-generated sessionId (stored in localStorage on the frontend),
// so guests never need to log in to keep a persistent cart across visits.

router.get('/:sessionId', asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ sessionId: req.params.sessionId }).catch(() => null)
  if (cart) {
    cart = await Cart.findOne({ sessionId: req.params.sessionId }).populate('items.product').catch(() => cart)
  }
  res.json(cart || { sessionId: req.params.sessionId, items: [] })
}))

router.put('/:sessionId', asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    { items: req.body.items },
    { new: true, upsert: true }
  )
  res.json(cart)
}))

router.delete('/:sessionId', asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ sessionId: req.params.sessionId }, { items: [] })
  res.json({ message: 'Cart cleared' })
}))

export default router
