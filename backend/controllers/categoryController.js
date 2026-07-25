import asyncHandler from 'express-async-handler'
import Category from '../models/Category.js'

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort('order')
  res.json(categories)
})

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body)
  res.status(201).json(category)
})

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(category)
})

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id)
  res.json({ message: 'Category deleted' })
})
