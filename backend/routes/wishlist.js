import express from 'express'
import asyncHandler from 'express-async-handler'
import Wishlist from '../models/Wishlist.js'

const router = express.Router()

router.get('/:sessionId', asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ sessionId: req.params.sessionId }).populate('products')
  res.json(wishlist || { sessionId: req.params.sessionId, products: [] })
}))

router.post('/:sessionId/toggle', asyncHandler(async (req, res) => {
  const { productId } = req.body
  let wishlist = await Wishlist.findOne({ sessionId: req.params.sessionId })
  if (!wishlist) wishlist = await Wishlist.create({ sessionId: req.params.sessionId, products: [] })

  const exists = wishlist.products.some((p) => p.toString() === productId)
  wishlist.products = exists
    ? wishlist.products.filter((p) => p.toString() !== productId)
    : [...wishlist.products, productId]

  await wishlist.save()
  res.json(wishlist)
}))

export default router
