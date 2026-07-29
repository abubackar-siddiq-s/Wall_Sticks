import express from 'express'
import { body } from 'express-validator'
import { adminLogin, requestOtp, verifyOtp } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/admin/login', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
], validate, adminLogin)

router.post('/customer/request-otp', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').isString().trim().isLength({ min: 10 }).withMessage('A valid 10-digit mobile number is required'),
], validate, requestOtp)

router.post('/customer/verify-otp', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone').isString().trim().isLength({ min: 10 }).withMessage('A valid 10-digit mobile number is required'),
  body('code').isString().trim().isLength({ min: 4, max: 4 }).withMessage('A 4-digit code is required'),
], validate, verifyOtp)

export default router
