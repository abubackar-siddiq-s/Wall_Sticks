import Order from '../models/Order.js'
import Product from '../models/Product.js'

export async function getAdminStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // 1. Gross revenue for past 30 days (verified/shipped/delivered)
  const revenueAgg = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$pricing.total' } } },
  ])
  const revenue30d = revenueAgg[0]?.total || 0

  // 2. Counts
  const totalOrders = await Order.countDocuments()
  const pendingVerification = await Order.countDocuments({ status: 'payment_pending' })
  const completedOrders = await Order.countDocuments({ status: 'delivered' })

  // 3. Top selling posters
  const topProducts = await Product.find({ active: true })
    .sort('-reviewsCount -rating')
    .limit(5)

  // 4. Recent orders
  const recentOrders = await Order.find()
    .sort('-createdAt')
    .limit(5)

  return {
    revenue30d,
    totalOrders,
    pendingVerification,
    completedOrders,
    topProducts,
    recentOrders,
  }
}
