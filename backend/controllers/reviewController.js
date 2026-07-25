import asyncHandler from 'express-async-handler'
import Review from '../models/Review.js'
import Product from '../models/Product.js'

export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ approved: true })
    .populate('product', 'name')
    .sort('-createdAt')

  const formatted = reviews.map((r) => ({
    id: r._id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    product: typeof r.product === 'object' && r.product?.name ? r.product.name : 'Poster Wall',
    createdAt: r.createdAt,
  }))

  res.json(formatted)
})

export const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params
  if (!productId || String(productId).length !== 24) {
    return res.json([])
  }
  const reviews = await Review.find({ product: productId, approved: true }).sort('-createdAt')
  res.json(reviews)
})

export const getFeaturedReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ approved: true, rating: { $gte: 4 } })
    .populate('product', 'name')
    .sort('-createdAt')
    .limit(6)

  const formatted = reviews.map((r) => ({
    id: r._id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    product: typeof r.product === 'object' && r.product?.name ? r.product.name : 'Poster Wall',
    createdAt: r.createdAt,
  }))

  res.json(formatted)
})

export const createReview = asyncHandler(async (req, res) => {
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
})

export const deleteReview = asyncHandler(async (req, res) => {
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
})
