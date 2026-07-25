import asyncHandler from 'express-async-handler'
import Wishlist from '../models/Wishlist.js'

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ sessionId: req.params.sessionId }).populate('products')
  res.json(wishlist || { sessionId: req.params.sessionId, products: [] })
})

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body
  if (!productId || String(productId).length !== 24) {
    res.status(400)
    throw new Error('Valid Product ID is required')
  }

  let wishlist = await Wishlist.findOne({ sessionId: req.params.sessionId })
  if (!wishlist) {
    wishlist = await Wishlist.create({ sessionId: req.params.sessionId, products: [] })
  }

  const exists = wishlist.products.some((p) => String(p) === String(productId))
  wishlist.products = exists
    ? wishlist.products.filter((p) => String(p) !== String(productId))
    : [...wishlist.products, productId]

  await wishlist.save()
  const populated = await Wishlist.findById(wishlist._id).populate('products')
  res.json(populated)
})
