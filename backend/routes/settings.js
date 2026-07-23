import express from 'express'
import asyncHandler from 'express-async-handler'
import { body } from 'express-validator'
import Settings from '../models/Settings.js'
import { protectAdmin } from '../middleware/auth.js'
import { uploadPosterImages } from '../middleware/upload.js'
import { validate } from '../middleware/validate.js'

const router = express.Router()

// Settings is a singleton — always fetch/update the first (and only) document
router.get('/', asyncHandler(async (req, res) => {
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  res.json(settings)
}))

router.put('/', protectAdmin, uploadPosterImages.fields([{ name: 'logo', maxCount: 1 }, { name: 'upiQr', maxCount: 1 }]), [
  body('courierCharge').optional().isFloat({ min: 0 }).withMessage('Courier charge must be a positive number'),
  body('gstPercent').optional().isFloat({ min: 0, max: 100 }).withMessage('GST percent must be between 0 and 100'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('A valid email is required'),
], validate, asyncHandler(async (req, res) => {
  const update = { ...req.body }
  if (req.files?.logo) update.logo = { url: req.files.logo[0].path, publicId: req.files.logo[0].filename }
  if (req.files?.upiQr) update.upiQr = { url: req.files.upiQr[0].path, publicId: req.files.upiQr[0].filename }

  let settings = await Settings.findOne()
  settings = settings
    ? await Settings.findByIdAndUpdate(settings._id, update, { new: true })
    : await Settings.create(update)
  res.json(settings)
}))

export default router
