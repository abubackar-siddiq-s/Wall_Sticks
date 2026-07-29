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

  // 5. Real Weekly Revenue breakdown (past 12 weeks)
  const weeklyData = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const weekLabel = `W${12 - i}`

    const weekAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart, $lt: weekEnd },
          status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ])

    weeklyData.push({
      week: weekLabel,
      amount: weekAgg[0]?.total || 0,
    })
  }

  return {
    revenue30d,
    totalOrders,
    pendingVerification,
    completedOrders,
    topProducts,
    recentOrders,
    weeklyData,
  }
}
