import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Package, Receipt } from 'lucide-react'
import api from '../lib/api'
import { useCustomerAuth } from '../context/CustomerAuthContext'

const stages = ['Payment Pending', 'Verified', 'Printing', 'Packed', 'Shipped', 'Delivered']
const statusToStage = { payment_pending: 0, verified: 1, rejected: 1, printing: 2, packed: 3, shipped: 4, delivered: 5 }



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
              <div key={i} className="flex justify-between text-sm text-black/60 items-center">
                <span>{it.name} × {it.qty}</span>
                <span className="flex items-center gap-1.5 text-xs">
                  <span>{it.size}</span>
                  {it.border && (
                    <span className="flex items-center gap-1 bg-brand-smoke px-2 py-0.5 rounded-md font-semibold text-brand-black">
                      {it.borderColor && (
                        <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: it.borderColor }} />
                      )}
                      {it.border}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
          <Link
            to={`/receipt/${order.id}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold underline text-black/60 hover:text-black"
          >
            <Receipt size={13} /> View Receipt
          </Link>
        </div>
      )}
    </div>
  )
}

export default function MyOrders() {
  const { customer } = useCustomerAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer?.phone) {
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)

    api.get(`/orders/phone/${encodeURIComponent(customer.phone)}`)
      .then(({ data }) => {
        if (!isMounted) return
        const normalized = data.map((o) => ({
          id: o.orderNumber,
          date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          total: o.pricing?.total,
          stage: statusToStage[o.status] ?? 0,
          items: o.items.map((it) => ({ 
            name: it.name, 
            qty: it.quantity, 
            size: it.size, 
            border: it.border, 
            borderColor: it.borderColor 
          })),
        }))
        setOrders(normalized)
      })
      .catch(() => {
        if (isMounted) setOrders([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [customer?.phone])

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-1">My Orders</h1>
        {customer?.phone && (
          <p className="text-xs text-black/50 font-medium">
            Account: <span className="font-bold text-brand-black">+91 {customer.phone}</span>
          </p>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-black/40 text-sm font-medium">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-black/40 py-20 text-sm bg-brand-smoke rounded-xl2">
          No orders found for this account yet.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </div>
  )
}
