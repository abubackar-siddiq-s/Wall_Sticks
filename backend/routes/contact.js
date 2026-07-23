import express from 'express'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import ContactMessage from '../models/ContactMessage.js'
import { protectAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// POST /api/contact — public contact form submission.
// Two layers of spam defense, both cheap and dependency-free:
//   1. Honeypot: a `company` field that's hidden from real users via CSS but visible to
//      most naive bots, which fill every field they find. Any value here = silently drop it.
//   2. Rate limiting: applied at the app level in server.js (see publicWriteLimiter).
router.post('/', [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('message').isString().trim().isLength({ min: 5, max: 2000 }).withMessage('Message must be 5–2000 characters'),
], validate, asyncHandler(async (req, res) => {
  if (req.body.company) {
    // Honeypot tripped — pretend success so the bot doesn't learn anything, but don't save it.
    return res.status(201).json({ message: 'Message sent' })
  }
  const { name, email, message } = req.body
  await ContactMessage.create({ name, email, message })
  res.status(201).json({ message: 'Message sent' })
}))

// --- Admin ---

router.get('/', protectAdmin, asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort('-createdAt')
  res.json(messages)
}))

router.put('/:id/read', protectAdmin, asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
  res.json(message)
}))

export default router
