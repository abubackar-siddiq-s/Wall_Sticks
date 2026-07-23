// A standalone Express app for tests — mirrors server.js but skips connectDB()/rate-limiting/
// the real Cloudinary-backed upload middleware, since tests use an in-memory Mongo and don't
// need real image storage. Route logic itself (validation, status transitions) is untouched.
import express from 'express'
import authRoutes from '../routes/auth.js'
import productRoutes from '../routes/products.js'
import categoryRoutes from '../routes/categories.js'
import orderRoutes from '../routes/orders.js'
import paymentRoutes from '../routes/payments.js'
import cartRoutes from '../routes/cart.js'
import wishlistRoutes from '../routes/wishlist.js'
import reviewRoutes from '../routes/reviews.js'
import trendingRoutes from '../routes/trending.js'
import adminRoutes from '../routes/admin.js'
import settingsRoutes from '../routes/settings.js'
import contactRoutes from '../routes/contact.js'
import { notFound, errorHandler } from '../middleware/errorHandler.js'

export function buildTestApp() {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/orders', orderRoutes)
  app.use('/api/payments', paymentRoutes)
  app.use('/api/cart', cartRoutes)
  app.use('/api/wishlist', wishlistRoutes)
  app.use('/api/reviews', reviewRoutes)
  app.use('/api/trending', trendingRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/settings', settingsRoutes)
  app.use('/api/contact', contactRoutes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
