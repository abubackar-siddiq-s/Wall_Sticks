import express from 'express'
import * as wishlistController from '../controllers/wishlistController.js'
import { optionalCustomer } from '../middleware/auth.js'

const router = express.Router()

router.get('/:sessionId', optionalCustomer, wishlistController.getWishlist)
router.post('/:sessionId/toggle', optionalCustomer, wishlistController.toggleWishlist)

export default router
