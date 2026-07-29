import express from 'express'
import { body } from 'express-validator'
import * as orderController from '../controllers/orderController.js'
import { protectAdmin, optionalCustomer } from '../middleware/auth.js'
import { uploadCustomImage } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const orderValidators = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Each item needs a quantity of at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Each item needs a valid price'),
  body('shipping.name').isString().trim().notEmpty().withMessage('Shipping name is required'),
  body('shipping.phone').isString().trim().isLength({ min: 6 }).withMessage('A valid phone number is required'),
  body('deliveryMethod').optional().isIn(['courier', 'pickup']).withMessage('Invalid delivery method'),
  body('pricing.total').isFloat({ min: 0 }).withMessage('Order total is required'),
]

router.post('/upload-custom', uploadCustomImage.single('customImage'), orderController.uploadCustomImage)

router.post('/', optionalCustomer, uploadCustomImage.single('customImage'), orderController.parseOrderPayload, orderValidators, validate, orderController.createOrder)


router.get('/track/:orderNumber', orderController.getOrderByNumber)
router.get('/phone/:phone', optionalCustomer, orderController.getOrdersByPhone)

router.get('/', protectAdmin, orderController.getOrders)
router.put('/:id/status', protectAdmin, [
  body('status').isIn(['pending', 'payment_pending', 'verified', 'rejected', 'printing', 'packed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status value'),
], validate, orderController.updateOrderStatus)

export default router
