import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ sessionId: req.params.sessionId }).populate('items.product')
  res.json(cart || { sessionId: req.params.sessionId, items: [] })
})

export const updateCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    { items: req.body.items },
    { new: true, upsert: true }
  )
  res.json(cart)
})

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ sessionId: req.params.sessionId }, { items: [] })
  res.json({ message: 'Cart cleared' })
})
