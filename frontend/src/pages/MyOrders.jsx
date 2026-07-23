import { useState } from 'react'
import { ChevronDown, Package, Receipt, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { API_BASE_URL } from '../lib/api'

const stages = ['Payment Pending', 'Verified', 'Printing', 'Packed', 'Shipped', 'Delivered']
const statusToStage = { payment_pending: 0, verified: 1, rejected: 1, printing: 2, packed: 3, shipped: 4, delivered: 5 }

const demoOrders = [
  { id: 'PW482913', date: '18 Jul 2026', total: 748, stage: 3, items: [{ name: 'Midnight Skyline Motivational', qty: 1, size: 'A3' }] },
  { id: 'PW471820', date: '02 Jul 2026', total: 1278, stage: 5, items: [{ name: 'Discipline Equals Freedom', qty: 2, size: '18x24' }] },
]

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl2 shadow-soft overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between p-5 text-left">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-brand-smoke flex items-center justify-center">
            <Package size={18} />
          </div>
          <div>
            <p className="font-semibold text-sm">#{order.id}</p>
            <p className="text-xs text-black/45">{order.date} · ₹{order.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold bg-brand-yellow/20 text-brand-gold px-3 py-1.5 rounded-full hidden sm:inline">{stages[order.stage]}</span>
          <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="px-5 pb-6 border-t border-black/5 pt-5">
          <div className="flex justify-between mb-6 relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-black/10" />
            <div className="absolute top-3 left-0 h-0.5 bg-brand-yellow transition-all" style={{ width: `${(order.stage / (stages.length - 1)) * 100}%` }} />
            {stages.map((s, i) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-2" style={{ width: `${100 / stages.length}%` }}>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${i <= order.stage ? 'bg-brand-yellow border-brand-yellow' : 'bg-white border-black/15 text-black/30'}`}>
                  {i <= order.stage ? '✓' : ''}
                </div>
                <span className="text-[10px] text-center text-black/50 leading-tight hidden md:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 mb-5">
            {order.items.map((it, i) => (
              <div key={i} className="flex justify-between text-sm text-black/60">
                <span>{it.name} × {it.qty}</span>
                <span>{it.size}</span>
              </div>
            ))}
          </div>
          <a
            href={`${API_BASE_URL}/orders/${order.id}/receipt`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold underline text-black/60 hover:text-black"
          >
            <Receipt size={13} /> View Receipt
          </a>
        </div>
      )}
    </div>
  )
}

export default function MyOrders() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState(demoOrders)
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  const lookup = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return toast.error('Enter the phone number used at checkout')
    setLoading(true)
    try {
      const { data } = await api.get(`/orders/phone/${encodeURIComponent(phone.trim())}`)
      const normalized = data.map((o) => ({
        id: o.orderNumber,
        date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        total: o.pricing?.total,
        stage: statusToStage[o.status] ?? 0,
        items: o.items.map((it) => ({ name: it.name, qty: it.quantity, size: it.size })),
      }))
      setOrders(normalized)
      setSearched(true)
      if (normalized.length === 0) toast('No orders found for that number', { icon: 'ℹ️' })
    } catch {
      toast.error('Could not look up orders — check the backend connection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-6">My Orders</h1>

      <form onSubmit={lookup} className="flex gap-3 mb-8 max-w-md">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number used at checkout"
            className="w-full pl-10 pr-4 py-3 rounded-full bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm"
          />
        </div>
        <button disabled={loading} className="bg-brand-black text-brand-yellow font-semibold px-6 py-3 rounded-full text-sm disabled:opacity-60">
          {loading ? 'Looking up...' : 'Find Orders'}
        </button>
      </form>

      {!searched && (
        <p className="text-xs text-black/40 mb-4">Showing example orders — enter your phone number above to look up your real ones.</p>
      )}

      <div className="space-y-4">
        {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        {searched && orders.length === 0 && <p className="text-center text-black/40 py-16 text-sm">No orders found for that phone number.</p>}
      </div>
    </div>
  )
}
