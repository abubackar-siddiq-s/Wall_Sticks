import express from 'express'
import { body } from 'express-validator'
import * as paymentController from '../controllers/paymentController.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPaymentScreenshot } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/', uploadPaymentScreenshot.single('screenshot'), [
  body('orderId').isMongoId().withMessage('A valid orderId is required'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('phone').isString().trim().isLength({ min: 6 }).withMessage('A valid phone number is required'),
  body('transactionId').isString().trim().notEmpty().withMessage('Transaction ID is required'),
], validate, paymentController.createPayment)

router.put('/:id/verify', protectAdmin, paymentController.verifyPayment)
router.put('/:id/reject', protectAdmin, paymentController.rejectPayment)

export default router
