import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Eye,
  Package,
  Sparkles,
  ExternalLink,
  Download,
  Calendar,
  DollarSign,
  BarChart2,
  Award,
} from 'lucide-react'
import { imgSrc } from '../../lib/imageUrl'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

// STOCK MARKET GRADE REVENUE ANALYTICS SUITE
function StockRevenueAnalytics({ stats = {} }) {
  const [timeframe, setTimeframe] = useState('weekly')
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Custom Date Range State
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Active chart data determination
  const chartData = useMemo(() => {
    if (timeframe === 'daily') return stats.dailyData || []
    if (timeframe === 'weekly') return stats.weeklyData || []
    if (timeframe === 'monthly') return stats.monthlyData || []
    if (timeframe === 'yearly') return stats.yearlyData || []

    if (timeframe === 'custom') {
      const orders = stats.allVerifiedOrders || []
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const dateMap = {}
      const cur = new Date(start)
      while (cur <= end) {
        const key = cur.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        dateMap[key] = { label: key, subLabel: cur.toLocaleDateString('en-IN', { year: '2-digit' }), amount: 0, ordersCount: 0 }
        cur.setDate(cur.getDate() + 1)
      }

      orders.forEach((o) => {
        const oDate = new Date(o.date)
        if (oDate >= start && oDate <= end) {
          const key = oDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          if (dateMap[key]) {
            dateMap[key].amount += o.total || 0
            dateMap[key].ordersCount += 1
          }
        }
      })

      return Object.values(dateMap)
    }

    return stats.weeklyData || []
  }, [timeframe, stats, startDate, endDate])

  // Summary Metrics
  const totalRevenue = useMemo(() => chartData.reduce((sum, d) => sum + (d.amount || 0), 0), [chartData])
  const totalOrdersCount = useMemo(() => chartData.reduce((sum, d) => sum + (d.ordersCount || 0), 0), [chartData])
  const aov = useMemo(() => (totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0), [totalRevenue, totalOrdersCount])

  const maxAmount = useMemo(() => Math.max(...chartData.map((d) => d.amount || 0), 0), [chartData])
  const peakItem = useMemo(() => chartData.find((d) => (d.amount || 0) === maxAmount && maxAmount > 0), [chartData, maxAmount])

  // Growth Trend (Second half vs First half of active range)
  const growthTrend = useMemo(() => {
    if (chartData.length < 2) return 0
    const mid = Math.floor(chartData.length / 2)
    const firstHalf = chartData.slice(0, mid).reduce((sum, d) => sum + (d.amount || 0), 0)
    const secondHalf = chartData.slice(mid).reduce((sum, d) => sum + (d.amount || 0), 0)

    if (firstHalf === 0) return secondHalf > 0 ? 100 : 0
    return Math.round(((secondHalf - firstHalf) / firstHalf) * 100)
  }, [chartData])

  // Export CSV Report
  const exportCsv = () => {
    if (!chartData || chartData.length === 0) return
    let csv = 'Timeframe / Date,Sub-Label,Gross Revenue (INR),Orders Count,Average Order Value (INR)\n'
    chartData.forEach((d) => {
      const itemAov = d.ordersCount > 0 ? Math.round(d.amount / d.ordersCount) : 0
      csv += `"${d.label || d.week}","${d.subLabel || ''}",${d.amount || 0},${d.ordersCount || 0},${itemAov}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `WallSticks_Revenue_Report_${timeframe}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-black/5 flex flex-col justify-between">
      {/* TIMEFRAME HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-gold">
              <BarChart2 size={18} />
            </div>
            <h3 className="font-extrabold text-lg text-brand-black">Stock Revenue Analytics</h3>
          </div>
          <p className="text-xs text-black/45 mt-0.5">Real-time financial performance, volume & growth analytics</p>
        </div>

        {/* TIMEFRAME SELECTOR TABS */}
        <div className="flex flex-wrap items-center gap-1.5 bg-brand-smoke/80 p-1.5 rounded-2xl border border-black/5">
          {[
            { id: 'daily', label: '7D Daily' },
            { id: 'weekly', label: '12W Weekly' },
            { id: 'monthly', label: '12M Monthly' },
            { id: 'yearly', label: 'Yearly' },
            { id: 'custom', label: 'Custom Date' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === t.id
                  ? 'bg-brand-black text-brand-yellow shadow-md'
                  : 'text-black/60 hover:text-black hover:bg-black/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOM DATE RANGE PICKER (WHEN CUSTOM IS SELECTED) */}
      {timeframe === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 bg-brand-smoke/50 p-3 rounded-2xl border border-black/5 mb-6 animate-fade-in text-xs font-semibold">
          <Calendar size={15} className="text-brand-gold" />
          <div className="flex items-center gap-2">
            <span className="text-black/50">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-black/10 text-brand-black outline-none focus:border-brand-black font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black/50">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white border border-black/10 text-brand-black outline-none focus:border-brand-black font-bold"
            />
          </div>
        </div>
      )}

      {/* METRICS HUD DISPLAY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-brand-smoke/40 border border-black/5">
        <div>
          <span className="text-[11px] font-bold text-black/45 uppercase tracking-wider block mb-1">Gross Revenue</span>
          <span className="text-xl sm:text-2xl font-extrabold text-brand-black">₹{totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-black/45 uppercase tracking-wider block mb-1">Growth Trend</span>
          <div className="flex items-center gap-1.5">
            {growthTrend >= 0 ? (
              <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <TrendingUp size={13} /> +{growthTrend}%
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md">
                <TrendingDown size={13} /> {growthTrend}%
              </span>
            )}
          </div>
        </div>
        <div>
          <span className="text-[11px] font-bold text-black/45 uppercase tracking-wider block mb-1">Avg Order Value</span>
          <span className="text-xl sm:text-2xl font-extrabold text-brand-black">₹{aov.toLocaleString('en-IN')}</span>
        </div>
        <div>
          <span className="text-[11px] font-bold text-black/45 uppercase tracking-wider block mb-1">Period High</span>
          <span className="text-xs font-extrabold text-amber-600 bg-amber-500/10 px-2 py-1 rounded-lg inline-flex items-center gap-1">
            <Award size={13} /> {peakItem ? `${peakItem.label || peakItem.week}: ₹${maxAmount.toLocaleString('en-IN')}` : '₹0'}
          </span>
        </div>
      </div>

      {/* CHART CANVAS */}
      {chartData.length === 0 || maxAmount === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-black/10 rounded-2xl p-6 text-center">
          <BarChart2 size={28} className="text-black/25 mb-2" />
          <p className="text-xs font-bold text-black/60">No sales revenue recorded for selected timeframe</p>
          <p className="text-[11px] text-black/40 mt-1">Try switching timeframe tabs or adjusting your custom date range.</p>
        </div>
      ) : (
        <div>
          {/* GRID & BARS CONTAINER */}
          <div className="relative h-56 pt-8 pb-3 px-2 border-b border-black/10">
            {/* BACKGROUND GRID LINES */}
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-dashed border-black/30 w-full" />
              <div className="border-b border-dashed border-black/30 w-full" />
              <div className="border-b border-dashed border-black/30 w-full" />
            </div>

            <div className="flex items-end gap-2 h-full relative z-10">
              {chartData.map((item, i) => {
                const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
                const isHovered = hoveredIndex === i
                const isPeak = maxAmount > 0 && item.amount === maxAmount

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  >
                    {/* HOVER TOOLTIP CARD */}
                    {isHovered && (
                      <div className="absolute -top-16 bg-brand-black text-white font-bold text-[11px] p-2 rounded-xl shadow-2xl z-30 whitespace-nowrap border border-white/10 animate-fade-in flex flex-col items-center gap-0.5">
                        <span className="text-brand-yellow font-extrabold text-xs">₹{item.amount.toLocaleString('en-IN')}</span>
                        <span className="text-white/70 text-[10px]">{item.ordersCount || 0} Orders · AOV ₹{item.ordersCount > 0 ? Math.round(item.amount / item.ordersCount) : 0}</span>
                      </div>
                    )}

                    {/* BAR VISUAL */}
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isPeak
                          ? 'bg-gradient-to-t from-brand-black via-amber-700 to-brand-gold shadow-lg ring-2 ring-brand-gold/40'
                          : isHovered
                          ? 'bg-brand-black shadow-md'
                          : 'bg-brand-yellow/35 hover:bg-brand-yellow/70'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 4)}%` }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* X-AXIS LABELS */}
          <div className="flex justify-between text-[11px] font-bold text-black/50 px-1 pt-3">
            {chartData.map((d, i) => (
              <div key={i} className="text-center flex flex-col items-center">
                <span>{d.label || d.week}</span>
                {d.subLabel && <span className="text-[9px] text-black/35 font-normal">{d.subLabel}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
        <span className="text-xs font-semibold text-black/50">Showing {chartData.length} period datapoints</span>
        <button
          onClick={exportCsv}
          className="bg-brand-smoke hover:bg-brand-yellow/30 text-brand-black font-extrabold text-xs px-4 py-2 rounded-xl border border-black/10 flex items-center gap-1.5 transition-all shadow-sm"
        >
          <Download size={14} /> Export CSV Report
        </button>
      </div>
    </div>
  )
}

const defaultStats = {
  revenue30d: 0,
  totalOrders: 0,
  pendingVerification: 0,
  completedOrders: 0,
  topProducts: [],
  recentOrders: [],
  dailyData: [],
  weeklyData: [],
  monthlyData: [],
  yearlyData: [],
  allVerifiedOrders: [],
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(defaultStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => {
        setStats(data || defaultStats)
      })
      .catch(() => {
        setStats(defaultStats)
      })
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      label: 'Revenue (30 Days)',
      value: `₹${Number(stats.revenue30d || 0).toLocaleString('en-IN')}`,
      change: '30-day verified gross',
      icon: TrendingUp,
      bg: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders || 0,
      change: 'All-time store orders',
      icon: ShoppingBag,
      bg: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Pending Verification',
      value: stats.pendingVerification || 0,
      change: 'Needs payment approval',
      icon: Clock3,
      bg: 'bg-orange-500/10 text-orange-600',
      urgent: (stats.pendingVerification || 0) > 0,
    },
    {
      label: 'Completed Orders',
      value: stats.completedOrders || 0,
      change: 'Delivered successfully',
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10 text-emerald-600',
    },
  ]

  const trending = stats.topProducts || []
  const recent = stats.recentOrders || []

  const getStatusBadge = (status) => {
    switch (status) {
      case 'payment_pending':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Awaiting Verification</span>
      case 'verified':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Payment Verified</span>
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Shipped</span>
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Delivered</span>
      default:
        return <span className="bg-gray-100 text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-full">{status}</span>
    }
  }

  return (
    <AdminLayout title="Overview Dashboard">
      {/* QUICK HEADER CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center text-brand-gold">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-brand-black">Store Operations Center</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-black/50 font-medium">
                Live System Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="bg-brand-black text-brand-yellow font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 hover:shadow-md transition-all"
          >
            <Plus size={15} /> Add Poster
          </Link>
          <Link
            to="/admin/orders"
            className="border-2 border-black/10 hover:border-brand-black text-brand-black font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Package size={15} /> Manage Orders
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="p-2.5 text-black/50 hover:text-black rounded-xl border border-black/10 hover:border-black/30 transition-colors"
            title="Preview Live Storefront"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl p-5 shadow-soft border transition-all ${
              s.urgent ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-black/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">{s.label}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                <s.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-brand-black mb-1">{s.value}</p>
            <p className="text-[11px] font-bold text-black/45">{s.change}</p>
          </div>
        ))}
      </div>

      {/* ANALYTICS CHARTS & TOP POSTERS */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 mb-8">
        {/* STOCK-GRADE REVENUE ANALYTICS */}
        <StockRevenueAnalytics stats={stats} />

        {/* TOP PERFORMING POSTERS */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-extrabold text-base text-brand-black">Top Selling Posters</h3>
            <Link to="/admin/products" className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="space-y-3.5">
            {trending.map((p) => (
              <div key={p._id} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-brand-smoke/50 transition-colors">
                <img
                  src={imgSrc(p.images?.[0])}
                  className="w-11 h-14 object-contain bg-white rounded-xl border border-black/10 shrink-0"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-black truncate">{p.name}</p>
                  <div className="flex items-center gap-2 text-[11px] text-black/45 mt-0.5">
                    <span className="font-semibold text-brand-black">₹{p.price}</span>
                    <span>·</span>
                    <span className="text-amber-500 font-bold">★ {p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS QUICK CONTROL TABLE */}
      <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-extrabold text-base text-brand-black">Recent Customer Orders</h3>
            <p className="text-xs text-black/45">Latest orders placed on WallSticks</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold bg-brand-black text-brand-yellow px-3.5 py-2 rounded-xl flex items-center gap-1 hover:shadow-md transition-all"
          >
            Go to Orders <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-wider font-extrabold text-black/45">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-medium">
              {recent.map((o) => (
                <tr key={o._id} className="hover:bg-brand-smoke/40 transition-colors">
                  <td className="py-3.5 px-3 font-extrabold text-brand-black">#{o.orderNumber}</td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-brand-black">{o.shipping?.name || 'Customer'}</div>
                    <div className="text-[11px] text-black/40">{o.shipping?.phone}</div>
                  </td>
                  <td className="py-3.5 px-3 font-extrabold">₹{o.pricing?.total || 0}</td>
                  <td className="py-3.5 px-3">{getStatusBadge(o.status)}</td>
                  <td className="py-3.5 px-3 text-right">
                    <Link
                      to="/admin/orders"
                      className="inline-flex items-center gap-1 text-xs font-bold text-black/70 hover:text-brand-black bg-brand-smoke hover:bg-brand-yellow/30 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Eye size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
