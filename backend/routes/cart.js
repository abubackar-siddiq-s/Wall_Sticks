import express from 'express'
import * as cartController from '../controllers/cartController.js'

const router = express.Router()

router.get('/:sessionId', cartController.getCart)
router.put('/:sessionId', cartController.updateCart)
router.delete('/:sessionId', cartController.clearCart)

export default router
