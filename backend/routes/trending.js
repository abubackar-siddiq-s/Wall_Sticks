import express from 'express'
import asyncHandler from 'express-async-handler'
import Trending from '../models/Trending.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const trending = await Trending.find().populate('product').sort('order')
  res.json(trending)
}))

router.post('/', protectAdmin, asyncHandler(async (req, res) => {
  const item = await Trending.create({ product: req.body.productId, order: req.body.order || 0 })
  res.status(201).json(item)
}))

// PUT /api/trending/reorder — body: [{ id, order }] for drag-and-drop save
router.put('/reorder', protectAdmin, asyncHandler(async (req, res) => {
  const updates = req.body.items || []
  await Promise.all(updates.map((u) => Trending.findByIdAndUpdate(u.id, { order: u.order })))
  res.json({ message: 'Order saved' })
}))

router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  await Trending.findByIdAndDelete(req.params.id)
  res.json({ message: 'Removed from trending' })
}))

export default router
