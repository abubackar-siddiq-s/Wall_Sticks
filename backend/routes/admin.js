import express from 'express'
import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/admin/stats — dashboard summary
router.get('/stats', protectAdmin, asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [revenueAgg, totalOrders, pending, completed, topProducts, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $nin: ['payment_pending', 'rejected'] } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    Order.countDocuments(),
    Order.countDocuments({ status: 'payment_pending' }),
    Order.countDocuments({ status: 'delivered' }),
    Product.find({ active: true }).sort('-reviewsCount').limit(5),
    Order.find().sort('-createdAt').limit(5),
  ])

  res.json({
    revenue30d: revenueAgg[0]?.total || 0,
    totalOrders,
    pendingVerification: pending,
    completedOrders: completed,
    topProducts,
    recentOrders,
  })
}))

export default router
