import express from 'express'
import { body } from 'express-validator'
import { adminLogin, customerLogin } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/admin/login', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
], validate, adminLogin)

router.post('/customer/login', [
  body('phone').isString().trim().isLength({ min: 10 }).withMessage('A valid 10-digit mobile number is required'),
], validate, customerLogin)

export default router
