import express from 'express'
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import Admin from '../models/Admin.js'
import User from '../models/User.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'wallsticks_jwt_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/admin/login  — single-admin login, JWT issued on success
router.post('/admin/login', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
], validate, asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const admin = await Admin.findOne({ email: email?.toLowerCase() })
  if (!admin || !(await admin.comparePassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }
  res.json({
    token: signToken(admin._id),
    admin: { id: admin._id, email: admin.email, name: admin.name },
  })
}))

// POST /api/auth/customer/login — mobile customer auth (upsert user by phone)
router.post('/customer/login', [
  body('phone').isString().trim().isLength({ min: 10 }).withMessage('A valid 10-digit mobile number is required'),
], validate, asyncHandler(async (req, res) => {
  const { phone, name = 'Customer' } = req.body
  const cleanedPhone = phone.replace(/\D/g, '')

  let user = await User.findOne({ phone: cleanedPhone })
  if (!user) {
    user = await User.create({ phone: cleanedPhone, name })
  }

  res.json({
    token: signToken(user._id),
    user: { id: user._id, phone: user.phone, name: user.name }
  })
}))

export default router
