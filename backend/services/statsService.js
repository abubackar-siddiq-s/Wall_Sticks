import Order from '../models/Order.js'
import Product from '../models/Product.js'

export async function getAdminStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // 1. Gross revenue for past 30 days
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

  // 5. DAILY REVENUE BREAKDOWN (Past 7 Days)
  const dailyData = []
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 6; i >= 0; i--) {
    const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 0, 0, 0)
    const dEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i, 23, 59, 59, 999)
    const dayLabel = daysOfWeek[dStart.getDay()]
    const dateStr = dStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

    const dayAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dStart, $lte: dEnd },
          status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        },
      },
    ])

    dailyData.push({
      label: dayLabel,
      subLabel: dateStr,
      amount: dayAgg[0]?.total || 0,
      ordersCount: dayAgg[0]?.count || 0,
    })
  }

  // 6. WEEKLY REVENUE BREAKDOWN (Past 12 Weeks)
  const weeklyData = []
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
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        },
      },
    ])

    weeklyData.push({
      week: weekLabel,
      label: weekLabel,
      subLabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
      amount: weekAgg[0]?.total || 0,
      ordersCount: weekAgg[0]?.count || 0,
    })
  }

  // 7. MONTHLY REVENUE BREAKDOWN (Past 12 Months)
  const monthlyData = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  for (let i = 11; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const monthLabel = monthNames[mStart.getMonth()]

    const monthAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: mStart, $lte: mEnd },
          status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        },
      },
    ])

    monthlyData.push({
      label: monthLabel,
      subLabel: `${mStart.getFullYear()}`,
      amount: monthAgg[0]?.total || 0,
      ordersCount: monthAgg[0]?.count || 0,
    })
  }

  // 8. YEARLY REVENUE BREAKDOWN (Past 3 Years)
  const yearlyData = []
  const currentYear = now.getFullYear()
  for (let y = currentYear - 2; y <= currentYear; y++) {
    const yStart = new Date(y, 0, 1)
    const yEnd = new Date(y, 11, 31, 23, 59, 59)

    const yearAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yStart, $lte: yEnd },
          status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 },
        },
      },
    ])

    yearlyData.push({
      label: `${y}`,
      subLabel: `Year ${y}`,
      amount: yearAgg[0]?.total || 0,
      ordersCount: yearAgg[0]?.count || 0,
    })
  }

  // 9. Lightweight All-Orders Summary for Custom Date Filter
  const allVerifiedOrders = await Order.find(
    { status: { $in: ['verified', 'printing', 'packed', 'shipped', 'delivered'] } },
    { createdAt: 1, 'pricing.total': 1 }
  ).lean()

  return {
    revenue30d,
    totalOrders,
    pendingVerification,
    completedOrders,
    topProducts,
    recentOrders,
    dailyData,
    weeklyData,
    monthlyData,
    yearlyData,
    allVerifiedOrders: allVerifiedOrders.map((o) => ({
      date: o.createdAt,
      total: o.pricing?.total || 0,
    })),
  }
}
