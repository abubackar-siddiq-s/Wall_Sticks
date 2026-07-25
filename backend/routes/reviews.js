import express from 'express'
import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'
import Product from '../models/Product.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/reviews/product/:productId — returns all approved reviews for a poster
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params
  const reviews = await Review.find({
    $or: [{ product: productId }, { product: String(productId) }],
    approved: true
  }).sort('-createdAt')
  res.json(reviews)
}))

// POST /api/reviews — post a new review for a poster
router.post('/', asyncHandler(async (req, res) => {
  const { product, name, rating, text } = req.body
  if (!product || !name || !rating) {
    res.status(400)
    throw new Error('Product ID, name, and rating are required')
  }

  const review = await Review.create({
    product,
    name: name.trim(),
    rating: Number(rating),
    text: (text || '').trim(),
    approved: true,
  })

  // Recalculate average rating & total reviews for the product
  const allReviews = await Review.find({
    $or: [{ product: product }, { product: String(product) }],
    approved: true
  })

  const count = allReviews.length
  const avg = count ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0

  if (String(product).length === 24) {
    await Product.findByIdAndUpdate(product, { rating: Number(avg), reviewsCount: count }).catch(() => {})
  }

  res.status(201).json(review)
}))

// DELETE /api/reviews/:id (Admin only)
router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (review) {
    const productId = review.product
    await Review.findByIdAndDelete(req.params.id)

    const allReviews = await Review.find({
      $or: [{ product: productId }, { product: String(productId) }],
      approved: true
    })
    const count = allReviews.length
    const avg = count ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1) : 0

    if (String(productId).length === 24) {
      await Product.findByIdAndUpdate(productId, { rating: Number(avg), reviewsCount: count }).catch(() => {})
    }
  }
  res.json({ message: 'Review deleted' })
}))

export default router
