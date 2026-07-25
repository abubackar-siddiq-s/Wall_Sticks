import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Eye,
  Package,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { imgSrc } from '../../lib/imageUrl'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

// Interactive Revenue Bar Chart
function RevenueChart() {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const data = [
    { week: 'W1', amount: 12400 },
    { week: 'W2', amount: 16800 },
    { week: 'W3', amount: 14200 },
    { week: 'W4', amount: 21500 },
    { week: 'W5', amount: 19800 },
    { week: 'W6', amount: 26400 },
    { week: 'W7', amount: 23100 },
    { week: 'W8', amount: 29500 },
    { week: 'W9', amount: 27800 },
    { week: 'W10', amount: 32400 },
    { week: 'W11', amount: 31000 },
    { week: 'W12', amount: 38500 },
  ]

  const max = Math.max(...data.map((d) => d.amount))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-black/50 font-semibold">
        <span>Weekly Revenue Growth</span>
        <span className="text-brand-gold bg-brand-yellow/15 px-2.5 py-1 rounded-full flex items-center gap-1">
          <TrendingUp size={13} /> Peak: ₹{max.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="flex items-end gap-2.5 h-48 pt-6 pb-2 px-2 relative border-b border-black/10">
        {data.map((item, i) => {
          const heightPercent = (item.amount / max) * 100
          const isHovered = hoveredIndex === i
          const isPeak = item.amount === max

          return (
            <div
              key={item.week}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
            >
              {/* HOVER TOOLTIP */}
              {isHovered && (
                <div className="absolute -top-10 bg-brand-black text-brand-yellow font-bold text-[11px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-20 animate-fade-in">
                  ₹{item.amount.toLocaleString('en-IN')}
                </div>
              )}

              {/* BAR */}
              <div
                className={`w-full rounded-t-lg transition-all duration-300 ${
                  isPeak
                    ? 'bg-gradient-to-t from-brand-black to-brand-gold shadow-md'
                    : isHovered
                    ? 'bg-brand-black'
                    : 'bg-brand-yellow/30 hover:bg-brand-yellow/60'
                }`}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          )
        })}
      </div>

      <div className="flex justify-between text-[11px] font-bold text-black/45 px-1">
        {data.map((d) => (
          <span key={d.week}>{d.week}</span>
        ))}
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
  recentOrders: []
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
      change: '30-day total',
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
      change: 'Needs approval',
      icon: Clock3,
      bg: 'bg-orange-500/10 text-orange-600',
      urgent: (stats.pendingVerification || 0) > 0,
    },
    {
      label: 'Completed Orders',
      value: stats.completedOrders || 0,
      change: 'Fulfillment completed',
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
                Live MongoDB Operations Active
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
        {/* REVENUE GRAPH */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-extrabold text-base text-brand-black">Revenue Analytics</h3>
              <p className="text-xs text-black/45">Weekly gross sales breakdown</p>
            </div>
            <span className="text-xs font-bold text-black/60 bg-brand-smoke px-3 py-1.5 rounded-full border border-black/5">
              12 Weeks
            </span>
          </div>
          <RevenueChart />
        </div>

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
                  className="w-11 h-14 object-cover rounded-xl border border-black/10 shrink-0"
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
