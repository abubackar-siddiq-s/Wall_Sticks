import { useEffect, useState, useRef } from 'react'
import { X, Phone, MapPin, Search, Printer, CheckCircle2, Clock, Truck, ShieldAlert, FileText, ExternalLink, Palette, MessageSquareText, Sparkles, Download, Sliders } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'

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

// ADMIN HIGH-RES POSTER CANVAS RENDER MODAL WITH LIVE CANVAS ENGINE
function PosterBorderRenderModal({ item, onClose }) {
  const [renderBgColor, setRenderBgColor] = useState(item.borderColor || (item.border === 'White Border' ? '#FFFFFF' : '#C1272D'))
  const [borderType, setBorderType] = useState(item.border || 'Custom Border')
  const [borderPercent, setBorderPercent] = useState(5) // 5% default border width
  const [rendering, setRendering] = useState(true)
  const [renderError, setRenderError] = useState(null)

  const canvasRef = useRef(null)

  // Robust Image URL Resolution
  const rawImgPath = item.productImage || item.customImage?.url || item.image || (item.product && typeof item.product === 'object' ? (item.product.images?.[0] || item.product.image) : null)
  const imageUrl = imgSrc(rawImgPath)

  // Live Canvas Rendering Engine
  useEffect(() => {
    if (!imageUrl) {
      setRenderError('No poster image available for this item')
      setRendering(false)
      return
    }

    setRendering(true)
    setRenderError(null)

    let isMounted = true
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    const drawCanvas = (sourceImg) => {
      if (!isMounted || !canvas) return
      const ctx = canvas.getContext('2d')

      const isNoBorder = borderType === 'No Border'
      const borderWidth = isNoBorder ? 0 : Math.max(16, Math.round(sourceImg.naturalWidth * (borderPercent / 100)))

      canvas.width = sourceImg.naturalWidth + (borderWidth * 2)
      canvas.height = sourceImg.naturalHeight + (borderWidth * 2)

      // Draw Border Background
      if (!isNoBorder) {
        const fillColor = borderType === 'White Border' ? '#FFFFFF' : renderBgColor
        ctx.fillStyle = fillColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Draw Main Poster Artwork
      ctx.drawImage(sourceImg, borderWidth, borderWidth, sourceImg.naturalWidth, sourceImg.naturalHeight)
      setRendering(false)
    }

    img.onload = () => drawCanvas(img)

    img.onerror = () => {
      // Fallback without crossOrigin if CORS blocks direct load
      const fallbackImg = new Image()
      fallbackImg.onload = () => drawCanvas(fallbackImg)
      fallbackImg.onerror = () => {
        if (isMounted) {
          setRenderError('Failed to load poster image file')
          setRendering(false)
        }
      }
      fallbackImg.src = imageUrl
    }

    img.src = imageUrl

    return () => { isMounted = false }
  }, [imageUrl, borderType, renderBgColor, borderPercent])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return toast.error('Canvas element not ready')

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.download = `${(item.name || 'poster').replace(/\s+/g, '_')}_with_border.png`
          a.href = url
          a.click()
          setTimeout(() => URL.revokeObjectURL(url), 5000)
          toast.success('Downloaded high-res poster with border!')
        } else {
          const dataUrl = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.download = `${(item.name || 'poster').replace(/\s+/g, '_')}_with_border.png`
          a.href = dataUrl
          a.click()
          toast.success('Downloaded high-res poster with border!')
        }
      }, 'image/png', 1.0)
    } catch (err) {
      if (imageUrl) {
        window.open(imageUrl, '_blank')
        toast('Opened image in new tab (CORS restricted)', { icon: 'ℹ️' })
      } else {
        toast.error('Could not export canvas image')
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto" onClick={onClose}>
      <div 
        className="bg-[#18181B] text-white rounded-3xl p-5 sm:p-7 w-full max-w-xl shadow-2xl flex flex-col gap-4 border border-white/10 max-h-[92vh] my-auto overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-gray-100 flex items-center gap-2">
              <Palette className="text-brand-yellow" size={20} /> High-Res Poster Print Renderer
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-400">Generates print-ready PNG with customer's border applied</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE BODY CONTENT (LIVE CANVAS + CONTROLS) */}
        <div className="overflow-y-auto space-y-4 pr-1">
          {/* LIVE CANVAS DISPLAY CONTAINER */}
          <div className="w-full min-h-[180px] max-h-[270px] bg-[#111114] rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-white/15 relative p-3">
            {rendering && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-xs font-bold text-brand-yellow animate-pulse">
                Rendering High-Res Canvas...
              </div>
            )}
            {renderError ? (
              <div className="text-center text-red-400 text-xs font-bold p-4 space-y-2">
                <p>{renderError}</p>
                {imageUrl && (
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-brand-yellow underline text-xs">
                    View Source Image
                  </a>
                )}
              </div>
            ) : (
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[250px] w-auto h-auto object-contain shadow-2xl rounded-lg border border-white/20 transition-all duration-300" 
              />
            )}
          </div>

          {/* BORDER ADJUSTMENT CONTROLS */}
          <div className="bg-[#242429] rounded-2xl p-4 border border-white/10 text-xs space-y-3">
            <div className="flex justify-between items-center font-extrabold text-gray-200">
              <span className="truncate max-w-[240px] text-sm">{item.name}</span>
              <span className="bg-brand-yellow text-brand-black px-2 py-0.5 rounded-md text-[11px] font-extrabold">Size: {item.size}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-white/10">
              {/* Border Type Selector */}
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Border Type</label>
                <select
                  value={borderType}
                  onChange={(e) => setBorderType(e.target.value)}
                  className="w-full bg-[#18181B] border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none font-bold cursor-pointer"
                >
                  <option value="No Border">No Border</option>
                  <option value="White Border">White Border</option>
                  <option value="Custom Border">Custom Border</option>
                </select>
              </div>

              {/* Border Color Picker */}
              {borderType === 'Custom Border' && (
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Border Color Hex</label>
                  <div className="flex items-center bg-[#18181B] border border-white/15 rounded-xl px-2.5 py-1 text-xs">
                    <span 
                      className="w-3.5 h-3.5 rounded-full border border-white/40 mr-2 shrink-0" 
                      style={{ backgroundColor: renderBgColor }} 
                    />
                    <input
                      type="text"
                      value={renderBgColor}
                      onChange={(e) => setRenderBgColor(e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-mono text-white outline-none font-bold uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Border Width Slider */}
            {borderType !== 'No Border' && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                  <span>Border Thickness ({borderPercent}%)</span>
                  <span>{borderPercent}% Ratio</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  value={borderPercent}
                  onChange={(e) => setBorderPercent(Number(e.target.value))}
                  className="w-full accent-brand-yellow cursor-pointer"
                />
              </div>
            )}

            {/* ITEM NOTES IF PRESENT */}
            {item.notes && (
              <div className="pt-2 border-t border-white/10 text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                <span className="font-extrabold flex items-center gap-1.5 text-xs">
                  <MessageSquareText size={14} className="text-amber-400 shrink-0" /> Special Customer Instructions:
                </span>
                <p className="mt-0.5 text-xs italic font-medium text-gray-200">{item.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* FIXED ACTIONS FOOTER */}
        <div className="flex gap-3 pt-3 border-t border-white/10 shrink-0">
          <button onClick={onClose} className="flex-1 bg-[#27272A] hover:bg-[#323236] font-bold py-3 rounded-2xl text-xs text-gray-300 transition-colors">
            Close
          </button>
          <button 
            onClick={handleDownload} 
            disabled={rendering || !!renderError}
            className="flex-2 bg-brand-yellow text-brand-black hover:bg-yellow-400 font-extrabold py-3 px-5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
          >
            <Download size={16} /> Download High-Res Poster File (.PNG)
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderModal({ order, onClose, onUpdate }) {
  const [renderItem, setRenderItem] = useState(null)
  const currentIndex = statusFlow.indexOf(order.status)
  const nextStatus = statusFlow[currentIndex + 1]

  const receiptUrl = `/receipt/${order.id}`
  const allNotes = [
    order.orderNotes ? `Order Note: "${order.orderNotes}"` : null,
    order.paymentNotes ? `Payment Note: "${order.paymentNotes}"` : null,
    ...(order.items?.filter((it) => it.notes).map((it) => `${it.name}: "${it.notes}"`) || []),
  ].filter(Boolean)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-5 pb-4 border-b border-black/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-xl text-brand-black">#{order.id}</h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${statusColor[order.status]}`}>
                  {statusLabel[order.status] || order.status}
                </span>
                {allNotes.length > 0 && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MessageSquareText size={12} className="text-amber-700" /> Has Special Notes ({allNotes.length})
                  </span>
                )}
              </div>
              <p className="text-xs text-black/45 mt-0.5">Placed on {order.date}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-smoke transition-colors"><X size={20} /></button>
          </div>

          <div className="space-y-5 text-xs">
            
            {/* SPECIAL INSTRUCTIONS CALLOUT BOX */}
            {allNotes.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-amber-900 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-extrabold text-sm text-amber-800">
                  <MessageSquareText size={16} className="text-amber-600 shrink-0" />
                  <span>Customer Special Instructions & Order Notes</span>
                </div>
                <div className="space-y-1 pl-6">
                  {allNotes.map((note, i) => (
                    <p key={i} className="text-xs font-semibold text-black/80 italic">• {note}</p>
                  ))}
                </div>
              </div>
            )}

            {/* CUSTOMER DETAILS */}
            <div className="bg-brand-smoke p-4 rounded-2xl border border-black/5 space-y-1.5">
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-wider">Customer Details</p>
              <p className="font-extrabold text-sm text-brand-black">{order.name}</p>
              <p className="flex items-center gap-1.5 font-bold text-black/70">
                <Phone size={13} className="text-brand-gold" /> +91 {order.phone}
              </p>
              <p className="flex items-start gap-1.5 text-black/60 pt-0.5">
                <MapPin size={13} className="mt-0.5 shrink-0 text-brand-gold" />
                <span>{order.address || 'Store Pickup (Perundurai, Erode)'}</span>
              </p>
            </div>

            {/* ITEMS ORDERED */}
            <div>
              <p className="font-extrabold text-black/60 uppercase tracking-wider mb-2.5 text-xs">
                Items Ordered ({order.items?.length || 1})
              </p>
              <div className="space-y-3">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="bg-brand-smoke/70 rounded-2xl p-4 space-y-3 border border-black/10">
                    <div className="flex gap-3.5 items-start">
                      {it.productImage ? (
                        <a href={it.productImage} target="_blank" rel="noopener noreferrer" className="w-14 h-18 bg-white border border-black/15 rounded-xl shrink-0 overflow-hidden flex items-center justify-center group/item shadow-sm">
                          <img src={it.productImage} alt={it.name} className="w-full h-full object-contain group-hover/item:scale-105 transition-transform duration-300" />
                        </a>
                      ) : (
                        <div className="w-14 h-18 bg-brand-yellow/20 border border-brand-yellow/40 rounded-xl shrink-0 flex flex-col items-center justify-center text-[11px] font-extrabold text-brand-gold shadow-sm">
                          Poster
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-extrabold text-brand-black truncate text-sm">
                            {it.name}
                            {it.isCustom && (
                              <span className="ml-1.5 text-[9px] bg-brand-yellow text-brand-black px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wide">
                                Custom Upload
                              </span>
                            )}
                          </p>
                          <span className="font-extrabold text-xs text-brand-black">₹{it.price || order.total}</span>
                        </div>

                        {/* PROMINENT SIZE & BORDER BADGE */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-black/10 text-xs font-bold text-brand-black">
                            Size: {it.size}
                          </span>
                          <span className="bg-white px-2.5 py-1 rounded-lg border border-black/10 text-xs font-bold text-brand-black flex items-center gap-1.5">
                            {it.borderColor ? (
                              <span className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0 inline-block shadow-sm" style={{ backgroundColor: it.borderColor }} />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-black/30 bg-gray-200 shrink-0 inline-block" />
                            )}
                            <span>{it.border || 'No Border'}</span>
                          </span>
                          <span className="text-black/50 text-xs font-medium">Qty: {it.qty || 1}</span>
                        </div>

                        {/* ITEM LEVEL NOTES */}
                        {it.notes && (
                          <div className="mt-2 p-2 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900">
                            <span className="font-extrabold text-[11px]">Item Note:</span> "{it.notes}"
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {it.productImage && (
                            <a href={it.productImage} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline font-extrabold text-xs flex items-center gap-1">
                              <ExternalLink size={13} /> View Full Poster Image
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setRenderItem(it)}
                            className="bg-brand-black text-brand-yellow hover:bg-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
                          >
                            <Palette size={13} /> Render & Download Poster with Border
                          </button>
                        </div>
                      </div>
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

      {renderItem && (
        <PosterBorderRenderModal item={renderItem} onClose={() => setRenderItem(null)} />
      )}
    </>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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
            orderNotes: o.notes || '',
            paymentNotes: o.payment?.notes || '',
            total: o.pricing?.total || 399,
            status: o.status === 'payment_pending' ? 'pending' : o.status,
            rawDate: new Date(o.createdAt || Date.now()),
            date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            items: o.items?.map((it) => {
              const rawImg = it.productImage || it.customImage?.url || (it.product && typeof it.product === 'object' ? (it.product.images?.[0] || it.product.image) : null)
              const resolvedImg = imgSrc(rawImg)

              return {
                name: it.name,
                qty: it.quantity,
                size: it.size,
                price: it.price,
                border: it.border,
                borderColor: it.borderColor,
                notes: it.notes,
                isCustom: it.isCustom,
                customImage: it.customImage,
                productImage: resolvedImg
              }
            }) || [],
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

  const getPriorityScore = (status) => {
    switch (status) {
      case 'pending': return 1
      case 'verified': return 2
      case 'printing': return 3
      case 'packed': return 3
      case 'shipped': return 4
      case 'delivered': return 5
      case 'rejected': return 6
      default: return 7
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    const scoreA = getPriorityScore(a.status)
    const scoreB = getPriorityScore(b.status)
    if (scoreA !== scoreB) return scoreA - scoreB
    return b.rawDate - a.rawDate
  })

  const filteredOrders = sortedOrders.filter((o) => {
    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesSearch = 
        o.id.toLowerCase().includes(q) ||
        (o.name || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.orderNotes || '').toLowerCase().includes(q) ||
        (o.paymentNotes || '').toLowerCase().includes(q) ||
        o.items.some((it) => (it.name || '').toLowerCase().includes(q) || (it.border || '').toLowerCase().includes(q) || (it.notes || '').toLowerCase().includes(q))
      if (!matchesSearch) return false
    }

    if (activeTab === 'all') return true
    if (activeTab === 'pending') return o.status === 'pending'
    if (activeTab === 'verified') return o.status === 'verified'
    if (activeTab === 'printing') return o.status === 'printing'
    if (activeTab === 'completed') return o.status === 'shipped' || o.status === 'delivered'
    return true
  })

  return (
    <AdminLayout title="Orders Management">
      <div className="space-y-6">
        {/* TOP BAR: TABS & SEARCH */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-soft border border-black/5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'pending', label: 'Needs Verification' },
              { id: 'verified', label: 'Verified' },
              { id: 'printing', label: 'In Printing' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-brand-black text-brand-yellow shadow-sm'
                    : 'bg-brand-smoke text-black/70 hover:bg-black/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-brand-smoke border border-black/10 rounded-xl px-3.5 py-2 w-full sm:w-64 focus-within:border-brand-black">
            <Search size={15} className="text-black/40 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order, customer, border, notes..."
              className="bg-transparent text-xs outline-none font-medium w-full text-brand-black"
            />
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-black/5 text-black/40 text-sm font-semibold">
              No orders found matching criteria.
            </div>
          ) : (
            filteredOrders.map((o) => {
              const allNotes = [
                o.orderNotes ? `Order Note: "${o.orderNotes}"` : null,
                o.paymentNotes ? `Payment Note: "${o.paymentNotes}"` : null,
                ...(o.items?.filter((it) => it.notes).map((it) => `${it.name}: "${it.notes}"`) || []),
              ].filter(Boolean)

              const hasNotes = allNotes.length > 0

              return (
                <div
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className="bg-white p-5 rounded-2xl border border-black/5 shadow-soft hover:shadow-md transition-all cursor-pointer flex flex-col gap-3.5"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-extrabold text-base text-brand-black">#{o.id}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColor[o.status]}`}>
                          {statusLabel[o.status] || o.status}
                        </span>
                        {hasNotes && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <MessageSquareText size={11} className="text-amber-700" /> Has Notes ({allNotes.length})
                          </span>
                        )}
                      </div>
                      <p className="font-extrabold text-xs text-brand-black">{o.name} · +91 {o.phone}</p>
                      <p className="text-[11px] text-black/45">{o.date} · {o.qty} total item(s)</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-extrabold text-base text-brand-black">₹{o.total}</p>
                        <p className="text-[10px] text-black/40 font-mono">Txn: {o.txnId}</p>
                      </div>
                      <button className="bg-brand-black text-brand-yellow hover:shadow-glow font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* ITEM PROMINENT PREVIEW STRIP ON CARD */}
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="bg-brand-smoke/60 p-2.5 rounded-xl border border-black/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {it.productImage && (
                            <img src={it.productImage} alt="" className="w-7 h-9 object-contain bg-white rounded border border-black/10 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-bold text-brand-black truncate text-[11px]">{it.name}</p>
                            <p className="text-[10px] text-black/50">Size: {it.size} · Qty {it.qty}</p>
                          </div>
                        </div>

                        {/* DIRECT BORDER BADGE */}
                        <div className="flex items-center gap-1 shrink-0 bg-white px-1.5 sm:px-2 py-1 rounded-lg border border-black/10 text-[10px] font-bold text-brand-black">
                          {it.borderColor ? (
                            <span className="w-2.5 h-2.5 rounded-full border border-black/30 shrink-0" style={{ backgroundColor: it.borderColor }} />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-200 border border-black/20 shrink-0" />
                          )}
                          <span className="truncate max-w-[70px] sm:max-w-[90px]">{it.border || 'No Border'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DIRECT NOTES BANNER IF PRESENT */}
                  {hasNotes && (
                    <div className="bg-amber-50/90 border border-amber-200/80 p-2.5 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                      <MessageSquareText size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <span className="font-extrabold text-[11px]">Customer Special Instructions:</span>
                        {allNotes.map((noteStr, i) => (
                          <p key={i} className="text-[11px] font-medium text-black/80 truncate">
                            • {noteStr}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )
            })
          )}
        </div>
      </div>

      {selected && (
        <OrderModal order={selected} onClose={() => setSelected(null)} onUpdate={updateStatus} />
      )}
    </AdminLayout>
  )
}
