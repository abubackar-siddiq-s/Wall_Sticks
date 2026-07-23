import express from 'express'
import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, approved: true }).sort('-createdAt')
  res.json(reviews)
}))

router.post('/', asyncHandler(async (req, res) => {
  const review = await Review.create(req.body)
  // Recalculate product rating average
  const stats = await Review.aggregate([
    { $match: { product: review.product, approved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  if (stats.length) {
    await Product.findByIdAndUpdate(review.product, { rating: stats[0].avg.toFixed(1), reviewsCount: stats[0].count })
  }
  res.status(201).json(review)
}))

router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (review) {
    const productId = review.product
    await Review.findByIdAndDelete(req.params.id)
    const stats = await Review.aggregate([
      { $match: { product: productId, approved: true } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
    if (stats.length) {
      await Product.findByIdAndUpdate(productId, { rating: stats[0].avg.toFixed(1), reviewsCount: stats[0].count })
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0, reviewsCount: 0 })
    }
  }
  res.json({ message: 'Review deleted' })
}))

export default router
