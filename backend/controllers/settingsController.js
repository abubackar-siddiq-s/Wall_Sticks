import asyncHandler from 'express-async-handler'
import Settings from '../models/Settings.js'

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne()
  if (!settings) settings = await Settings.create({})
  res.json(settings)
})

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne()
  if (!settings) {
    settings = new Settings({})
  }

  const update = { ...req.body }

  if (req.files?.logo) {
    update.logo = { url: req.files.logo[0].path, publicId: req.files.logo[0].filename }
  }
  if (req.files?.upiQr) {
    update.upiQr = { url: req.files.upiQr[0].path, publicId: req.files.upiQr[0].filename }
  }

  Object.assign(settings, update)

  if (update.sizePrices) {
    settings.sizePrices = update.sizePrices
    settings.markModified('sizePrices')
  }
  if (update.sizeDescriptions) {
    settings.sizeDescriptions = update.sizeDescriptions
    settings.markModified('sizeDescriptions')
  }

  await settings.save()
  res.json(settings)
})
