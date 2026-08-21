import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Trending from '../models/Trending.js'
import cloudinary from '../config/cloudinary.js'

export async function getProducts(queryParams) {
  const { search, category, maxPrice, sort = 'newest', page = 1, limit = 24 } = queryParams
  const filter = { active: true }
  
  if (category && category !== 'all') {
    const catId = await resolveCategoryInput(category)
    if (catId) filter.category = catId
  }
  if (maxPrice) {
    filter.price = { $lte: Number(maxPrice) }
  }
  if (search) {
    filter.$text = { $search: search }
  }

  const sortMap = {
    newest: '-createdAt',
    popular: '-reviewsCount',
    rating: '-rating',
    'price-low': 'price',
  }

  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort(sortMap[sort] || '-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit))

  const total = await Product.countDocuments(filter)
  return { products, total, page: Number(page), pages: Math.ceil(total / limit) }
}

export async function getTrendingProducts() {
  const trendingDocs = await Trending.find().populate('product').sort('order')
  return trendingDocs.map((t) => t.product).filter((p) => p && p.active)
}

export async function getBestSellerProducts() {
  return await Product.find({ bestSeller: true, active: true })
}

export async function getProductById(id) {
  if (!id || String(id).length !== 24) {
    const error = new Error('Product not found')
    error.statusCode = 404
    throw error
  }
  const product = await Product.findById(id).populate('category', 'name slug')
  if (!product) {
    const error = new Error('Product not found')
    error.statusCode = 404
    throw error
  }
  return product
}

export async function getRecommendedProducts(id) {
  if (!id || String(id).length !== 24) return []
  const product = await Product.findById(id)
  if (!product) return []
  return await Product.find({ category: product.category, _id: { $ne: product._id }, active: true }).limit(4)
}

async function uploadImagesIfNeeded(images) {
  if (!images || !images.length) return images
  const isTest = process.env.NODE_ENV === 'test'
  
  return await Promise.all(images.map(async (img) => {
    if (img && typeof img.url === 'string' && img.url.startsWith('data:image/')) {
      if (isTest) {
        return { url: 'https://example.com/mock-image.png', publicId: 'mock-id' }
      }
      try {
        const uploadRes = await cloudinary.uploader.upload(img.url, {
          folder: 'posterwall/products',
        })
        return { url: uploadRes.secure_url, publicId: uploadRes.public_id }
      } catch (err) {
        console.error('Cloudinary base64 upload failed:', err)
        return img
      }
    }
    return img
  }))
}

export async function resolveCategoryInput(categoryInput) {
  if (!categoryInput) {
    const defaultCat = await Category.findOne().sort('order')
    return defaultCat ? defaultCat._id : undefined
  }
  if (typeof categoryInput === 'string' && categoryInput.length !== 24) {
    const categoryDoc = await Category.findOne({ slug: categoryInput })
    if (categoryDoc) return categoryDoc._id
  }
  return categoryInput
}

export async function createProduct(data, images) {
  const categoryId = await resolveCategoryInput(data.category)
  const processedImages = await uploadImagesIfNeeded(images)
  return await Product.create({ ...data, category: categoryId, images: processedImages })
}

export async function updateProduct(id, data, images) {
  const update = { ...data }
  if (update.category) {
    update.category = await resolveCategoryInput(update.category)
  }
  if (images !== undefined) {
    update.images = await uploadImagesIfNeeded(images)
  }
  const product = await Product.findByIdAndUpdate(id, update, { new: true })
  if (!product) {
    const error = new Error('Product not found')
    error.statusCode = 404
    throw error
  }
  return product
}

export async function deleteProduct(id) {
  await Product.findByIdAndDelete(id)
  await Trending.deleteMany({ product: id })
  return { message: 'Product deleted' }
}
