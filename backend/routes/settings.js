import express from 'express'
import { body } from 'express-validator'
import * as settingsController from '../controllers/settingsController.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPosterImages } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.get('/', settingsController.getSettings)

router.put('/', protectAdmin, uploadPosterImages.fields([{ name: 'logo', maxCount: 1 }, { name: 'upiQr', maxCount: 1 }]), [
  body('courierCharge').optional().isFloat({ min: 0 }).withMessage('Courier charge must be a positive number'),
  body('gstPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('GST percent must be between 0 and 100'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('A valid email is required'),
], validate, settingsController.updateSettings)

export default router
