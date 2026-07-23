import express from 'express'
import asyncHandler from 'express-async-handler'
import Category from '../models/Category.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort('order')
  res.json(categories)
}))

router.post('/', protectAdmin, asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json(category)
}))

router.put('/:id', protectAdmin, asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(category)
}))

router.delete('/:id', protectAdmin, asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id)
  res.json({ message: 'Category deleted' })
}))

export default router
