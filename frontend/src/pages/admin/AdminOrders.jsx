import { useEffect, useState } from 'react'
import { X, Phone, MapPin, Search, Printer, CheckCircle2, Clock, Truck, ShieldAlert, FileText, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'



const statusFlow = ['pending', 'verified', 'printing', 'packed', 'shipped', 'delivered']

const statusLabel = {
  pending: 'Awaiting Verification',
  verified: 'Payment Verified',
  printing: 'In Printing',
  packed: 'Packed & Ready',
  shipped: 'Shipped',
  delivered: 'Delivered',
  rejected: 'Rejected',
}

const statusColor = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  verified: 'bg-blue-100 text-blue-800 border-blue-300',
  printing: 'bg-purple-100 text-purple-800 border-purple-300',
  packed: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  shipped: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
}

function OrderModal({ order, onClose, onUpdate }) {
  const currentIndex = statusFlow.indexOf(order.status)
  const nextStatus = statusFlow[currentIndex + 1]

  const receiptUrl = `/receipt/${order.id}`

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5 pb-4 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-brand-black">#{order.id}</h3>
              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${statusColor[order.status]}`}>
                {statusLabel[order.status] || order.status}
              </span>
            </div>
            <p className="text-xs text-black/45 mt-0.5">Placed on {order.date}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-smoke transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-5 text-xs">
          {/* CUSTOMER DETAILS */}
          <div className="bg-brand-smoke p-4 rounded-2xl border border-black/5 space-y-1.5">
            <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Customer Details</p>
            <p className="font-extrabold text-sm text-brand-black">{order.name}</p>
            <p className="flex items-center gap-1.5 font-bold text-black/70">
              <Phone size={13} className="text-brand-gold" /> {order.phone}
            </p>
            <p className="flex items-start gap-1.5 text-black/60 pt-0.5">
              <MapPin size={13} className="mt-0.5 shrink-0 text-brand-gold" />
              <span>{order.address || 'Store Pickup (Perundurai, Erode)'}</span>
            </p>
          </div>

          {/* ITEMS ORDERED */}
          <div>
            <p className="font-bold text-black/50 uppercase tracking-wider mb-2">Items Ordered ({order.items?.length || 1})</p>
            <div className="space-y-2.5">
              {order.items?.map((it, idx) => (
                <div key={idx} className="bg-brand-smoke/60 rounded-2xl p-3.5 flex gap-3 items-center border border-black/5">
                  {it.isCustom && it.customImage?.url ? (
                    <a href={it.customImage.url} target="_blank" rel="noopener noreferrer" className="w-12 h-15 bg-brand-yellow/15 border border-brand-yellow/30 rounded-xl shrink-0 overflow-hidden flex items-center justify-center group/item">
                      <img src={it.customImage.url} alt="Custom upload" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" />
                    </a>
                  ) : (
                    <div className="w-12 h-15 bg-brand-yellow/15 border border-brand-yellow/30 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-extrabold text-brand-gold">
                      Poster
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-brand-black truncate text-sm">
                      {it.name}
                      {it.isCustom && (
                        <span className="ml-1.5 text-[9px] bg-brand-yellow text-brand-black px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wide">
                          Custom
                        </span>
                      )}
                    </p>
                    <p className="text-black/60 font-medium mt-0.5">Size: <span className="font-bold text-brand-black">{it.size}</span></p>
                    <p className="text-black/45 mt-0.5">Qty: {it.qty || 1} · ₹{it.price || order.total} total</p>
                    {it.isCustom && it.customImage?.url && (
                      <a href={it.customImage.url} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline font-bold text-[11px] flex items-center gap-1 mt-1.5">
                        <ExternalLink size={12} /> View Original Image
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRICING & PAYMENT */}
          <div className="border-t border-black/10 pt-4 space-y-2">
            <div className="flex justify-between items-center text-sm font-extrabold text-brand-black">
              <span>Total Amount</span>
              <span className="text-lg">₹{order.total}</span>
            </div>
            <div className="flex justify-between text-black/50 font-semibold">
              <span>Transaction ID</span>
              <span className="font-mono text-brand-black">{order.txnId || 'N/A'}</span>
            </div>
          </div>

          {/* RECEIPT SCREENSHOT PREVIEW */}
          {order.screenshotUrl && (
            <div className="border-t border-black/10 pt-4">
              <p className="font-bold text-black/50 uppercase tracking-wider mb-2">Payment Verification Screenshot</p>
              <a href={order.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full h-40 bg-brand-smoke rounded-2xl overflow-hidden relative border border-black/10">
                  <img src={order.screenshotUrl} alt="Payment Screenshot" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                    <ExternalLink size={14} /> View Full Image
                  </div>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2.5 mt-6 pt-4 border-t border-black/10">
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-brand-smoke text-brand-black font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 border border-black/10 hover:bg-black/5 transition-colors mb-1"
          >
            <Printer size={14} /> Print Official Receipt / Invoice
          </a>

          {order.status === 'pending' && (
            <>
              <button
                onClick={() => { onUpdate(order, 'verified'); toast.success('Payment verified!'); onClose() }}
                className="flex-1 bg-brand-black text-brand-yellow font-extrabold py-3.5 rounded-2xl text-xs hover:shadow-md transition-all"
              >
                Verify Payment
              </button>
              <button
                onClick={() => { onUpdate(order, 'rejected'); toast.error('Payment rejected'); onClose() }}
                className="flex-1 border-2 border-red-200 text-red-600 font-extrabold py-3.5 rounded-2xl text-xs hover:bg-red-50 transition-colors"
              >
                Reject Payment
              </button>
            </>
          )}

          {nextStatus && order.status !== 'pending' && (
            <button
              onClick={() => { onUpdate(order, nextStatus); toast.success(`Updated to ${statusLabel[nextStatus]}`); onClose() }}
              className="flex-1 bg-brand-black text-brand-yellow font-extrabold py-3.5 rounded-2xl text-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              Advance Status to {statusLabel[nextStatus]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  const fetchOrders = () => {
    api.get('/orders')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          const normalized = data.map((o) => ({
            _id: o._id,
            paymentId: o.payment?._id,
            id: o.orderNumber,
            name: o.shipping?.name,
            phone: o.shipping?.phone,
            address: [o.shipping?.address, o.shipping?.city, o.shipping?.state, o.shipping?.pincode].filter(Boolean).join(', '),
            size: o.items?.[0]?.size || 'A3',
            qty: o.items?.reduce((s, i) => s + i.quantity, 0) || 1,
            txnId: o.payment?.transactionId || '—',
            screenshotUrl: o.payment?.screenshot?.url,
            total: o.pricing?.total || 399,
            status: o.status === 'payment_pending' ? 'pending' : o.status,
            rawDate: new Date(o.createdAt || Date.now()),
            date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            items: o.items?.map((it) => ({
              name: it.name,
              qty: it.quantity,
              size: it.size,
              price: it.price,
              isCustom: it.isCustom,
              customImage: it.customImage,
            })) || [],
          }))
          setOrders(normalized)
        } else {
          setOrders([])
        }
      })
      .catch(() => {
        setOrders([])
      })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (order, status) => {
    const backendStatus = status === 'pending' ? 'payment_pending' : status
    try {
      if (status === 'verified' && order.paymentId) {
        await api.put(`/payments/${order.paymentId}/verify`)
      } else if (status === 'rejected' && order.paymentId) {
        await api.put(`/payments/${order.paymentId}/reject`)
      } else {
        await api.put(`/orders/${order._id}/status`, { status: backendStatus })
      }
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)))
      toast.success(`Order status updated to ${status}`)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save update to server')
    }
  }

  // Priority sorting: Priority 1 = pending (Awaiting Verification) at the very top, then verified, then in delivery, then completed
  const getPriorityScore = (status) => {
    switch (status) {
      case 'pending': return 1 // Top Priority (Needs approval)
      case 'verified': return 2
      case 'printing': return 3
      case 'packed': return 3
      case 'shipped': return 4
      case 'delivered': return 5
      case 'rejected': return 6
      default: return 7
    }
  }

  // Filter & Priority Sort
  const filtered = orders
    .filter((o) => {
      if (activeTab === 'all') return true
      if (activeTab === 'pending') return o.status === 'pending'
      if (activeTab === 'verified') return o.status === 'verified'
      if (activeTab === 'shipped') return ['shipped', 'packed', 'printing'].includes(o.status)
      if (activeTab === 'delivered') return o.status === 'delivered'
      return true
    })
    .sort((a, b) => {
      const scoreA = getPriorityScore(a.status)
      const scoreB = getPriorityScore(b.status)
      if (scoreA !== scoreB) return scoreA - scoreB
      return (b.rawDate || 0) - (a.rawDate || 0)
    })

  return (
    <AdminLayout title="Customer Orders Management">
      {/* TOOLBAR & STATUS TABS */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Awaiting Verification' },
            { id: 'verified', label: 'Verified' },
            { id: 'shipped', label: 'In Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-black text-brand-yellow shadow-sm'
                  : 'bg-brand-smoke text-black/60 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-black/50 bg-brand-smoke px-3.5 py-2.5 rounded-xl border border-black/5 shrink-0">
          {filtered.length} Priority Orders
        </span>
      </div>

      {/* ORDERS LIST */}
      <div className="space-y-3">
        {filtered.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelected(o)}
            className="w-full text-left bg-white rounded-2xl shadow-soft p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-card border border-black/5 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-smoke flex items-center justify-center font-extrabold text-xs text-brand-black shrink-0 group-hover:bg-brand-yellow/30 transition-colors">
                #{o.id.slice(-4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-brand-black">#{o.id}</span>
                  <span className="text-xs font-bold text-black/45">({o.date})</span>
                </div>
                <p className="text-xs text-black/60 font-medium mt-0.5">
                  <span className="font-bold text-brand-black">{o.name}</span> · {o.phone}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-5">
              <span className="font-extrabold text-base text-brand-black">₹{o.total}</span>
              <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full border ${statusColor[o.status]}`}>
                {statusLabel[o.status] || o.status}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-16 border border-black/5">
            <p className="text-sm font-bold text-black/40">No orders found.</p>
            <p className="text-xs text-black/30 mt-1">Try selecting another status tab or clear search query.</p>
          </div>
        )}
      </div>

      {/* DETAILED ORDER MODAL */}
      {selected && (
        <OrderModal
          order={selected}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}
    </AdminLayout>
  )
}
