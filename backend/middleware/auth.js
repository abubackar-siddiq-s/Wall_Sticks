import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import Admin from '../models/Admin.js'
import User from '../models/User.js'

// Protects admin-only routes. Expects: Authorization: Bearer <token>
export const protectAdmin = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized — admin login required')
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wallsticks_jwt_secret')

    if (decoded.role && decoded.role !== 'admin') {
      res.status(403)
      throw new Error('Access denied — Admin privileges required')
    }

    const admin = await Admin.findById(decoded.id).select('-password')
    if (!admin) {
      res.status(401)
      throw new Error('Not authorized — admin account not found')
    }
    req.admin = admin
    next()
  } catch (err) {
    if (!res.statusCode || res.statusCode === 200) res.status(401)
    const isJwtExpired = err.name === 'TokenExpiredError' || err.message?.includes('jwt expired')
    const message = isJwtExpired ? 'Session expired. Please log in again.' : (err.message || 'Not authorized')
    throw new Error(message)
  }
})

// Protects customer routes. Expects: Authorization: Bearer <token>
export const protectCustomer = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized — please log in first')
  }
  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wallsticks_jwt_secret')
    const user = await User.findById(decoded.id)
    if (!user) {
      res.status(401)
      throw new Error('Not authorized — customer account no longer exists')
    }
    req.user = user
    next()
  } catch (err) {
    res.status(401)
    throw new Error('Not authorized — invalid or expired token')
  }
})

// Optional customer auth (attaches user if valid token present, does not throw error if absent)
export const optionalCustomer = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      const token = header.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'wallsticks_jwt_secret')
      const user = await User.findById(decoded.id)
      if (user) {
        req.user = user
      }
    } catch {}
  }
  next()
})
