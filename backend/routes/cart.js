import express from 'express'
import * as cartController from '../controllers/cartController.js'
import { optionalCustomer } from '../middleware/auth.js'

const router = express.Router()

router.get('/:sessionId', optionalCustomer, cartController.getCart)
router.put('/:sessionId', optionalCustomer, cartController.updateCart)
router.delete('/:sessionId', optionalCustomer, cartController.clearCart)

export default router
