import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes from './routes/orders.js'
import invoiceRoutes from './routes/invoice.js'
import paymentRoutes from './routes/payments.js'
import cartRoutes from './routes/cart.js'
import wishlistRoutes from './routes/wishlist.js'
import reviewRoutes from './routes/reviews.js'
import trendingRoutes from './routes/trending.js'
import adminRoutes from './routes/admin.js'
import settingsRoutes from './routes/settings.js'
import contactRoutes from './routes/contact.js'
import autoSeed from './utils/autoSeed.js'

import fs from 'node:fs'
import path from 'node:path'

dotenv.config()

try {
  const sysPsh = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  const targets = [
    path.resolve('powershell.exe'),
    path.resolve('powershell'),
    path.resolve('..', 'powershell.exe'),
    path.resolve('..', 'powershell'),
    path.resolve('..', 'frontend', 'powershell.exe'),
    path.resolve('..', 'frontend', 'powershell'),
  ]
  targets.forEach((t) => {
    try {
      fs.copyFileSync(sysPsh, t)
    } catch {}
  })
} catch (e) {}

connectDB().then(() => autoSeed())

const app = express()

app.use(helmet())
try {
  const compression = (await import('compression')).default
  app.use(compression())
} catch {
  // Optional compression middleware fallback
}
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// Basic abuse protection on write-heavy public endpoints (payment submission, contact form, etc.)
const publicWriteLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.post('/api/payments', publicWriteLimiter)
app.post('/api/orders', publicWriteLimiter)
app.post('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 })) // contact form gets a stricter cap — legitimate users don't submit it 10x in 15 min

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/orders', invoiceRoutes)
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`WallSticks API running on port ${PORT}`))
