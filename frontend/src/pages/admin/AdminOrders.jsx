import { useEffect, useState } from 'react'
import { X, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

const initialOrders = [
  { id: 'PW482913', name: 'Rahul Verma', phone: '+91 90000 11122', address: '221B Anna Salai, Chennai, TN 600002', size: 'A3', finish: 'Framed', qty: 1, txnId: 'UPI2026071812345', total: 748, status: 'pending', date: '18 Jul 2026' },
  { id: 'PW471820', name: 'Sneha Iyer', phone: '+91 90000 33344', address: '14 MG Road, Bengaluru, KA 560001', size: '18x24', finish: 'Canvas', qty: 2, txnId: 'UPI2026071609876', total: 1278, status: 'verified', date: '16 Jul 2026' },
  { id: 'PW460112', name: 'Aditya Rao', phone: '+91 90000 55566', address: '9 Park Street, Kolkata, WB 700016', size: '12x18', finish: 'Premium Matte', qty: 1, txnId: 'UPI2026071011223', total: 649, status: 'shipped', date: '10 Jul 2026' },
]

const statusFlow = ['pending', 'verified', 'printing', 'packed', 'shipped', 'delivered']
const statusLabel = { pending: 'Payment Verification Pending', verified: 'Verified', printing: 'Printing', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', rejected: 'Rejected' }
const statusColor = { pending: 'bg-amber-100 text-amber-700', verified: 'bg-blue-100 text-blue-700', printing: 'bg-purple-100 text-purple-700', packed: 'bg-indigo-100 text-indigo-700', shipped: 'bg-cyan-100 text-cyan-700', delivered: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }

function OrderModal({ order, onClose, onUpdate }) {
  const currentIndex = statusFlow.indexOf(order.status)
  const nextStatus = statusFlow[currentIndex + 1]

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl2 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="font-bold text-lg">#{order.id}</h3>
            <span className={`inline-block mt-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-5 text-sm">
          <div>
            <p className="text-black/45 text-xs mb-1">Customer</p>
            <p className="font-semibold">{order.name}</p>
            <p className="flex items-center gap-1.5 text-black/60 mt-1"><Phone size={13} /> {order.phone}</p>
            <p className="flex items-start gap-1.5 text-black/60 mt-1"><MapPin size={13} className="mt-0.5 shrink-0" /> {order.address || 'Store Pickup'}</p>
          </div>

          <div>
            <p className="text-black/45 text-xs mb-2">Items Ordered ({order.qty})</p>
            <div className="space-y-3">
              {order.items?.map((it, idx) => (
                <div key={idx} className="bg-brand-smoke rounded-xl p-4 flex gap-3 items-start border border-black/5">
                  {it.isCustom ? (
                    <div className="w-16 h-20 bg-brand-black/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-black/5 relative group">
                      {it.customImageUrl ? (
                        <a href={it.customImageUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full block">
                          <img src={it.customImageUrl} className="w-full h-full object-cover" alt="Custom upload" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-black/40">Custom</span>
                      )}
                    </div>
                  ) : (
                    <div className="w-16 h-20 bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold text-brand-gold">
                      Poster
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{it.name}</p>
                    <p className="text-xs text-black/55 mt-1">
                      {[it.size, it.finish, it.border, it.orientation].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs text-black/45 mt-0.5">Qty: {it.qty} · ₹{it.price || (order.total / order.qty)} each</p>
                    {it.notes && (
                      <div className="text-xs bg-brand-yellow/15 border border-brand-yellow/30 text-brand-black px-2.5 py-1.5 rounded-lg mt-2 font-medium">
                        <span className="font-bold">Instructions:</span> {it.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <div className="flex justify-between items-center font-bold text-base mb-1">
              <span>Total Amount</span>
              <span>₹{order.total}</span>
            </div>
            <div className="flex justify-between text-xs text-black/45">
              <span>Transaction ID</span>
              <span className="font-mono">{order.txnId}</span>
            </div>
          </div>

          <div className="border-t border-black/5 pt-4">
            <p className="text-black/45 text-xs mb-2">Payment Receipt Screenshot</p>
            {order.screenshotUrl ? (
              <a href={order.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block group">
                <div className="w-full h-48 bg-brand-smoke rounded-xl overflow-hidden relative border border-black/5">
                  <img src={order.screenshotUrl} alt="Payment Screenshot" className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    Click to view full receipt
                  </div>
                </div>
              </a>
            ) : (
              <div className="w-full h-32 bg-brand-smoke rounded-xl flex items-center justify-center text-black/35 text-xs border border-dashed border-black/10">
                No screenshot uploaded
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-6">
          {order.status === 'pending' && (
            <>
              <button onClick={() => { onUpdate(order, 'verified'); toast.success('Payment verified'); onClose() }} className="flex-1 bg-brand-black text-brand-yellow font-bold py-3.5 rounded-full text-sm">Verify Payment</button>
              <button onClick={() => { onUpdate(order, 'rejected'); toast.error('Payment rejected'); onClose() }} className="flex-1 border-2 border-red-200 text-red-600 font-bold py-3.5 rounded-full text-sm">Reject Payment</button>
            </>
          )}
          {nextStatus && order.status !== 'pending' && (
            <button onClick={() => { onUpdate(order, nextStatus); toast.success(`Marked as ${statusLabel[nextStatus]}`); onClose() }} className="flex-1 bg-brand-black text-brand-yellow font-bold py-3.5 rounded-full text-sm">
              Mark {statusLabel[nextStatus]}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(initialOrders)
  const [isLive, setIsLive] = useState(false)
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('active')

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => {
        const normalized = data.map((o) => ({
          _id: o._id,
          paymentId: o.payment?._id,
          id: o.orderNumber,
          name: o.shipping?.name,
          phone: o.shipping?.phone,
          address: [o.shipping?.address, o.shipping?.city, o.shipping?.state, o.shipping?.pincode].filter(Boolean).join(', '),
          size: o.items?.[0]?.size,
          finish: o.items?.[0]?.finish,
          qty: o.items?.reduce((s, i) => s + i.quantity, 0),
          txnId: o.payment?.transactionId || '—',
          screenshotUrl: o.payment?.screenshot?.url,
          total: o.pricing?.total,
          status: o.status === 'payment_pending' ? 'pending' : o.status,
          date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: o.items?.map((it) => ({
            name: it.name,
            qty: it.quantity,
            size: it.size,
            finish: it.finish,
            border: it.border,
            orientation: it.orientation,
            notes: it.notes,
            price: it.price,
            isCustom: it.isCustom,
            customImageUrl: it.customImage?.url,
          })) || [],
        }))
        setOrders(normalized)
        setIsLive(true)
      })
      .catch(() => { setOrders(initialOrders); setIsLive(false) })
  }, [])

  const updateStatus = async (order, status) => {
    // Optimistic local update either way, so the UI feels instant
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status } : o))
    if (!isLive) return

    try {
      if (status === 'verified' && order.status === 'pending' && order.paymentId) {
        await api.put(`/payments/${order.paymentId}/verify`)
      } else if (status === 'rejected' && order.paymentId) {
        await api.put(`/payments/${order.paymentId}/reject`)
      } else {
        await api.put(`/orders/${order._id}/status`, { status })
      }
    } catch {
      toast.error('Could not save this update to the server — check the backend connection')
    }
  }

  const filtered = orders.filter((o) => tab === 'active' ? o.status !== 'delivered' : o.status === 'delivered')

  return (
    <AdminLayout title="Orders">
      {!isLive && (
        <p className="text-xs text-black/40 mb-4">Showing demo orders — connect the backend (see README) to see live orders.</p>
      )}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('active')} className={`px-5 py-2 rounded-full text-sm font-semibold ${tab === 'active' ? 'bg-brand-black text-brand-yellow' : 'bg-white text-black/60'}`}>Active</button>
        <button onClick={() => setTab('completed')} className={`px-5 py-2 rounded-full text-sm font-semibold ${tab === 'completed' ? 'bg-brand-black text-brand-yellow' : 'bg-white text-black/60'}`}>Completed</button>
      </div>

      <div className="space-y-4">
        {filtered.map((o) => (
          <button key={o.id} onClick={() => setSelected(o)} className="w-full text-left bg-white rounded-xl2 shadow-soft p-5 flex items-center justify-between hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-bold text-sm">#{o.id}</p>
                <p className="text-xs text-black/45">{o.name} · {o.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-bold text-sm hidden sm:block">₹{o.total}</span>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColor[o.status]}`}>{statusLabel[o.status]}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-center text-black/40 py-16 text-sm">No orders here yet.</p>}
      </div>

      {selected && (
        <OrderModal
          order={{
            ...selected,
            items: selected.items?.length ? selected.items : [
              { name: 'Demo Poster', qty: selected.qty || 1, size: selected.size || 'A3', finish: selected.finish || 'Premium Matte', border: 'White', orientation: 'Portrait', notes: '', price: selected.total }
            ]
          }}
          onClose={() => setSelected(null)}
          onUpdate={updateStatus}
        />
      )}
    </AdminLayout>
  )
}
