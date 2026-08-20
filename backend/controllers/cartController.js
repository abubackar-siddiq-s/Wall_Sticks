import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'

const validateSession = (req, sessionId) => {
  if (!sessionId) return false
  if (req.admin) return true
  
  if (req.user) {
    const userPhone = (req.user.phone || '').replace(/\D/g, '')
    const targetPhone = (sessionId || '').replace(/\D/g, '')
    const userId = req.user._id.toString()

    if (sessionId === userId) return true
    if (userPhone && targetPhone && (userPhone === targetPhone || targetPhone.endsWith(userPhone) || userPhone.endsWith(targetPhone))) return true
  }

  // Allow guest sessions (UUIDs or session strings)
  return true
}

export const getCart = asyncHandler(async (req, res) => {
  if (!validateSession(req, req.params.sessionId)) {
    res.status(403)
    throw new Error('Access denied to requested cart')
  }
  const cart = await Cart.findOne({ sessionId: req.params.sessionId }).populate('items.product')
  res.json(cart || { sessionId: req.params.sessionId, items: [] })
})

export const updateCart = asyncHandler(async (req, res) => {
  if (!validateSession(req, req.params.sessionId)) {
    res.status(403)
    throw new Error('Access denied to requested cart')
  }
  const cart = await Cart.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    { items: req.body.items },
    { new: true, upsert: true }
  )
  res.json(cart)
})

export const clearCart = asyncHandler(async (req, res) => {
  if (!validateSession(req, req.params.sessionId)) {
    res.status(403)
    throw new Error('Access denied to requested cart')
  }
  await Cart.findOneAndUpdate({ sessionId: req.params.sessionId }, { items: [] })
  res.json({ message: 'Cart cleared' })
})
