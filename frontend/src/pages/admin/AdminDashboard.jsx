import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Clock3, CheckCircle2 } from 'lucide-react'
import { imgSrc } from '../../lib/imageUrl'
import AdminLayout from '../../components/AdminLayout'
import { products as mockProducts } from '../../data/mockData'
import api from '../../lib/api'

const demoStats = { revenue30d: 184320, totalOrders: 328, pendingVerification: 14, completedOrders: 289, topProducts: mockProducts.filter((p) => p.trending).slice(0, 5) }

// Simple SVG bar chart — no charting library dependency needed for a scaffold this size
function RevenueChart() {
  const data = [42, 58, 39, 71, 64, 88, 76, 95, 81, 102, 90, 118]
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((v, i) => (
        <div key={i} className="flex-1 bg-brand-yellow/25 hover:bg-brand-yellow rounded-t-md transition-colors" style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(demoStats)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => { setStats(data); setIsLive(true) })
      .catch(() => { setStats(demoStats); setIsLive(false) })
  }, [])

  const statCards = [
    { label: 'Revenue (30d)', value: `₹${Number(stats.revenue30d).toLocaleString('en-IN')}`, icon: TrendingUp },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag },
    { label: 'Pending Verification', value: stats.pendingVerification, icon: Clock3 },
    { label: 'Completed Orders', value: stats.completedOrders, icon: CheckCircle2 },
  ]
  const trending = stats.topProducts?.length ? stats.topProducts : demoStats.topProducts

  return (
    <AdminLayout title="Dashboard">
      {!isLive && (
        <p className="text-xs text-black/40 mb-4">Showing demo numbers — connect the backend (see README) to see live stats.</p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl2 p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-full bg-brand-yellow/15 flex items-center justify-center"><s.icon size={16} className="text-brand-gold" /></div>
            </div>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs text-black/45">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <div className="bg-white rounded-xl2 p-6 shadow-soft">
          <h3 className="font-bold mb-6">Revenue — last 12 weeks</h3>
          <RevenueChart />
        </div>
        <div className="bg-white rounded-xl2 p-6 shadow-soft">
          <h3 className="font-bold mb-5">Trending Posters</h3>
          <div className="space-y-3">
            {trending.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <img src={imgSrc(p.images[0])} className="w-10 h-12 object-cover rounded-lg" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-black/45">₹{p.price} · ★ {p.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
