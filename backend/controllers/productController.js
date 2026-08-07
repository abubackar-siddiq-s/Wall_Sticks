import asyncHandler from 'express-async-handler'
import * as productService from '../services/productService.js'

const normalizeImages = (req) => {
  let existing = []
  if (req.body.existingImages) {
    const raw = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]
    existing = raw.map((img) => {
      if (typeof img === 'string') {
        if (img.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(img)
            return { url: parsed.url || '', publicId: parsed.publicId || '' }
          } catch {}
        }
        return { url: img, publicId: '' }
      }
      if (img && typeof img === 'object') return { url: img.url || '', publicId: img.publicId || '' }
      return null
    }).filter(Boolean)
  }

  let uploaded = []
  if (req.files?.length) {
    uploaded = req.files.map((f) => ({ url: f.path, publicId: f.filename }))
  }

  if (existing.length || uploaded.length) {
    return [...existing, ...uploaded]
  }

  if (req.body.images) {
    const imgs = Array.isArray(req.body.images) ? req.body.images : [req.body.images]
    return imgs.map((img) => {
      if (typeof img === 'string') {
        if (img.trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(img)
            return { url: parsed.url || '', publicId: parsed.publicId || '' }
          } catch {}
        }
        return { url: img, publicId: '' }
      }
      if (img && typeof img === 'object') return { url: img.url || '', publicId: img.publicId || '' }
      return null
    }).filter(Boolean)
  }
  return undefined
}

export const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getProducts(req.query)
  res.json(result)
})

export const getTrendingProducts = asyncHandler(async (req, res) => {
  const result = await productService.getTrendingProducts()
  res.json(result)
})

export const getBestSellerProducts = asyncHandler(async (req, res) => {
  const result = await productService.getBestSellerProducts()
  res.json(result)
})

export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id)
  res.json(product)
})

export const getRecommendedProducts = asyncHandler(async (req, res) => {
  const recommended = await productService.getRecommendedProducts(req.params.id)
  res.json(recommended)
})

export const createProduct = asyncHandler(async (req, res) => {
  const images = normalizeImages(req) || []
  const product = await productService.createProduct(req.body, images)
  res.status(201).json(product)
})

export const updateProduct = asyncHandler(async (req, res) => {
  const images = normalizeImages(req)
  const product = await productService.updateProduct(req.params.id, req.body, images)
  res.json(product)
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id)
  res.json(result)
})
