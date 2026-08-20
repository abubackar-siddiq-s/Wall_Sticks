import asyncHandler from 'express-async-handler'
import Wishlist from '../models/Wishlist.js'

const validateSession = (req, sessionId) => {
  if (req.admin) return true
  const targetPhone = (sessionId || '').replace(/\D/g, '')
  const isUserTarget = String(sessionId).length === 24 || (targetPhone.length >= 10 && targetPhone.length <= 13)

  if (!isUserTarget) return true

  if (!req.user) return false

  const userPhone = (req.user.phone || '').replace(/\D/g, '')
  const userId = req.user._id.toString()

  if (sessionId === userId) return true
  if (userPhone && targetPhone && (userPhone === targetPhone || targetPhone.endsWith(userPhone) || userPhone.endsWith(targetPhone))) return true

  return false
}

export const getWishlist = asyncHandler(async (req, res) => {
  if (!validateSession(req, req.params.sessionId)) {
    res.status(403)
    throw new Error('Access denied to requested wishlist')
  }
  const wishlist = await Wishlist.findOne({ sessionId: req.params.sessionId }).populate('products')
  res.json(wishlist || { sessionId: req.params.sessionId, products: [] })
})

export const toggleWishlist = asyncHandler(async (req, res) => {
  if (!validateSession(req, req.params.sessionId)) {
    res.status(403)
    throw new Error('Access denied to requested wishlist')
  }
  const { productId } = req.body
  if (!productId || String(productId).length !== 24) {
    res.status(400)
    throw new Error('Valid Product ID is required')
  }

  const existing = await Wishlist.findOne({ sessionId: req.params.sessionId, products: productId })
  const updateOp = existing
    ? { $pull: { products: productId } }
    : { $addToSet: { products: productId } }

  const wishlist = await Wishlist.findOneAndUpdate(
    { sessionId: req.params.sessionId },
    updateOp,
    { new: true, upsert: true }
  ).populate('products')

  res.json(wishlist)
})
