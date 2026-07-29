import express from 'express'
import { body, query } from 'express-validator'
import * as productController from '../controllers/productController.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPosterImages } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.get('/', [
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sort').optional().isIn(['newest', 'popular', 'rating', 'price-low']).withMessage('Invalid sort value'),
], validate, productController.getProducts)

router.get('/trending', productController.getTrendingProducts)
router.get('/bestsellers', productController.getBestSellerProducts)
router.get('/:id', productController.getProductById)
router.get('/:id/recommended', productController.getRecommendedProducts)

const productValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').optional().isString().notEmpty().withMessage('Category is required'),
]

router.post('/', protectAdmin, uploadPosterImages.array('images', 6), productValidators, validate, productController.createProduct)

router.put('/:id', protectAdmin, uploadPosterImages.array('images', 6), [
  body('name').optional().isString().trim().isLength({ min: 2, max: 150 }).withMessage('Name must be 2–150 characters'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
], validate, productController.updateProduct)

router.delete('/:id', protectAdmin, productController.deleteProduct)

export default router
