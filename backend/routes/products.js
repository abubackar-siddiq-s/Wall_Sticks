import express from 'express'
import asyncHandler from 'express-async-handler'
import { body, query } from 'express-validator'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Trending from '../models/Trending.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPosterImages } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const normalizeImages = (req) => {
  if (req.files?.length) {
    return req.files.map((f) => ({ url: f.path, publicId: f.filename }))
  }
  if (req.body.images) {
    const imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
    return imgs.map((img) => {
      if (typeof img === 'string') return { url: img, publicId: '' }
      if (img && typeof img === 'object') return { url: img.url || '', publicId: img.publicId || '' }
      return null
    }).filter(Boolean)
  }
  return undefined
}

const resolveCategory = async (categoryInput) => {
  if (!categoryInput) return undefined
  if (typeof categoryInput === 'string' && categoryInput.length !== 24) {
    const categoryDoc = await Category.findOne({ slug: categoryInput })
    if (categoryDoc) return categoryDoc._id
  }
  return categoryInput
}

const router = express.Router()

// GET /api/products?search=&category=&maxPrice=&sort=&page=&limit=
router.get('/', [
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sort').optional().isIn(['newest', 'popular', 'rating', 'price-low']).withMessage('Invalid sort value'),
], validate, asyncHandler(async (req, res) => {
  const { search, category, maxPrice, sort = 'newest', page = 1, limit = 24 } = req.query
  const filter = { active: true }
  if (category && category !== 'all') filter.category = category
  if (maxPrice) filter.price = { $lte: Number(maxPrice) }
  if (search) filter.$text = { $search: search }

  const sortMap = {
    newest: '-createdAt',
    popular: '-reviewsCount',
    rating: '-rating',
    'price-low': 'price',
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortMap[sort] || '-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))

  const total = await Product.countDocuments(filter)
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) })
}))

router.get('/trending', asyncHandler(async (req, res) => {
  const products = await Product.find({ trending: true, active: true }).sort('trendingOrder').limit(12)
  res.json(products)
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug')
  if (!product) { res.status(404); throw new Error('Product not found') }
  res.json(product)
}))

router.get('/:id/recommended', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) { res.status(404); throw new Error('Product not found') }
  const recommended = await Product.find({ category: product.category, _id: { $ne: product._id }, active: true }).limit(4)
  res.json(recommended)
}))

// --- Admin-only management ---

const productValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isString().notEmpty().withMessage('Category is required'),
]

router.post('/', protectAdmin, uploadPosterImages.array('images', 6), productValidators, validate, asyncHandler(async (req, res) => {
  const categoryId = await resolveCategory(req.body.category)
  const images = normalizeImages(req) || []
  const product = await Product.create({ ...req.body, category: categoryId, images })
  res.status(201).json(product)
}))

router.put('/:id', protectAdmin, uploadPosterImages.array('images', 6), [
  body('name').optional().isString().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
], validate, asyncHandler(async (req, res) => {
  const update = { ...req.body }
  if (update.category) {
    update.category = await resolveCategory(update.category)
  }
  const images = normalizeImages(req)
  if (images !== undefined) update.images = images

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!product) { res.status(404); throw new Error('Product not found') }
  res.json(product)
}))

router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
  await Trending.deleteMany({ product: req.params.id })
  res.json({ message: 'Product deleted' })
}))

export default router
