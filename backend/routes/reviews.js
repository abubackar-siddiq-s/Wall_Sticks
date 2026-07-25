import express from 'express'
import * as reviewController from '../controllers/reviewController.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', reviewController.getAllReviews)
router.get('/featured', reviewController.getFeaturedReviews)
router.get('/product/:productId', reviewController.getProductReviews)
router.post('/', reviewController.createReview)
router.delete('/:id', protectAdmin, reviewController.deleteReview)

export default router
