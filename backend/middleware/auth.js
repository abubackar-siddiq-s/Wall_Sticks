import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import Admin from '../models/Admin.js'

// Protects admin-only routes. Expects: Authorization: Bearer <token>
export const protectAdmin = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized — no token provided')
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const admin = await Admin.findById(decoded.id).select('-password')
    if (!admin) {
      res.status(401)
      throw new Error('Not authorized — admin no longer exists')
    }
    req.admin = admin
    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized — invalid or expired token')
  }
})
