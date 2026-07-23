import express from 'express'
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import Admin from '../models/Admin.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

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

export default router
