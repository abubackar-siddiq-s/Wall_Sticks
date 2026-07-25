import express from 'express'
import * as wishlistController from '../controllers/wishlistController.js'

const router = express.Router()

router.get('/:sessionId', wishlistController.getWishlist)
router.post('/:sessionId/toggle', wishlistController.toggleWishlist)

export default router
