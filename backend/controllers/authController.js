import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import Admin from '../models/Admin.js'
import User from '../models/User.js'

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'wallsticks_jwt_secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

export const adminLogin = asyncHandler(async (req, res) => {
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
})

export const customerLogin = asyncHandler(async (req, res) => {
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
})
