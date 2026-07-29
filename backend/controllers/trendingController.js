import asyncHandler from 'express-async-handler'
import Trending from '../models/Trending.js'

export const getTrending = asyncHandler(async (req, res) => {
  const trending = await Trending.find().populate('product').sort('order')
  // Automatically clean up deleted products from trending list
  const validTrending = trending.filter(t => t.product !== null)
  if (validTrending.length !== trending.length) {
    const invalidIds = trending.filter(t => t.product === null).map(t => t._id)
    await Trending.deleteMany({ _id: { $in: invalidIds } })
  }
  res.json(validTrending)
})

export const addTrending = asyncHandler(async (req, res) => {
  const item = await Trending.create({ product: req.body.productId, order: req.body.order || 0 })
  res.status(201).json(item)
})

export const reorderTrending = asyncHandler(async (req, res) => {
  const updates = req.body.items || []
  await Promise.all(updates.map((u) => Trending.findByIdAndUpdate(u.id, { order: u.order })))
  res.json({ message: 'Order saved' })
})

export const removeTrending = asyncHandler(async (req, res) => {
  await Trending.findByIdAndDelete(req.params.id)
  res.json({ message: 'Removed from trending' })
})
