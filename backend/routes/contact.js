import express from 'express'
import { body } from 'express-validator'
import * as contactController from '../controllers/contactController.js'
import { protectAdmin } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/', [
  body('name').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('message').isString().trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required'),
], validate, contactController.submitContactForm)

router.get('/', protectAdmin, contactController.getContactMessages)
router.put('/:id/read', protectAdmin, contactController.markMessageRead)
router.delete('/:id', protectAdmin, contactController.deleteContactMessage)

export default router
