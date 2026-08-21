import { useEffect, useState } from 'react'
import { GripVertical, X, Plus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'

export default function AdminTrending() {
  const [items, setItems] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [dragIndex, setDragIndex] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/trending'), api.get('/products')])
      .then(([trendingRes, prodRes]) => {
        const trendingData = Array.isArray(trendingRes.data) ? trendingRes.data : []
        setItems(trendingData)
        const productsList = prodRes.data.products || prodRes.data
        setAllProducts(Array.isArray(productsList) ? productsList : [])
      })
      .catch(() => {})
  }, [])

  const onDragStart = (i) => () => setDragIndex(i)
  const onDragOver = (i) => (e) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    setItems((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIndex(i)
  }
  const onDragEnd = () => setDragIndex(null)

  const addProduct = async (product) => {
    if (items.some((i) => (i.product?._id || i._id) === product._id)) {
      return toast.error('Poster is already in trending list')
    }

    try {
      const { data } = await api.post('/trending', { productId: product._id, order: items.length })
      setItems((prev) => [...prev, { ...data, product }])
      setShowAdd(false)
      toast.success('Added to trending')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not add to trending')
    }
  }

  const removeItem = async (id) => {
    try {
      await api.delete(`/trending/${id}`)
      setItems((prev) => prev.filter((i) => i._id !== id))
      toast.success('Removed from trending')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not remove from trending')
    }
  }

  const saveOrder = async () => {
    if (items.length < 5) {
      toast.error(`Please select at least 5 Trending posters (currently ${items.length}).`)
      return
    }

    try {
      await api.put('/trending/reorder', { items: items.map((i, order) => ({ id: i._id, order })) })
      toast.success('Trending order saved to database!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save trending order')
    }
  }

  const availableToAdd = allProducts.filter((p) => !items.some((i) => (i.product?._id || i._id) === p._id))
  const isCountValid = items.length >= 5

  return (
    <AdminLayout title="Trending Posters Carousel">
      {/* STATUS & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-brand-black">Homepage Trending Carousel</h2>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isCountValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isCountValid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {items.length} Selected (Min: 5, Max: Unlimited)
            </span>
          </div>
          <p className="text-xs text-black/50 mt-0.5">
            Drag to reorder posters shown in the homepage trending carousel. Add unlimited posters (Minimum 5 required).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-white border-2 border-black/10 hover:border-brand-black font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            <Plus size={16} /> Add Poster
          </button>

          <button
            onClick={saveOrder}
            className="bg-brand-black text-brand-yellow font-extrabold px-5 py-2.5 rounded-xl text-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Save Order
          </button>
        </div>
      </div>

      {/* TRENDING ITEMS LIST */}
      <div className="space-y-3 max-w-2xl">
        {items.map((item, i) => {
          const p = item.product || item
          return (
            <div
              key={item._id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3.5 bg-white rounded-2xl p-3.5 shadow-soft border border-black/5 cursor-grab active:cursor-grabbing hover:border-brand-black/30 transition-all ${
                dragIndex === i ? 'opacity-40 bg-brand-smoke' : ''
              }`}
            >
              <GripVertical size={18} className="text-black/30 shrink-0" />
              <span className="w-6 h-6 rounded-lg bg-brand-smoke flex items-center justify-center text-xs font-extrabold text-brand-black shrink-0">
                {i + 1}
              </span>
              <img
                src={imgSrc(p?.images?.[0])}
                className="w-10 h-13 object-contain bg-white rounded-xl border border-black/10 shrink-0"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-brand-black truncate">{p?.name || 'Poster'}</p>
                <p className="text-xs text-black/45">Rating: ★ {p?.rating || 5.0}</p>
              </div>

              <button
                onClick={() => removeItem(item._id)}
                className="p-2 rounded-xl hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors"
                title="Remove from trending"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}

        {items.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-12 border border-black/5">
            <p className="text-sm font-bold text-black/40">No trending posters selected.</p>
            <p className="text-xs text-black/30 mt-1">Add at least 5 posters for the home carousel.</p>
          </div>
        )}
      </div>

      {/* ADD POSTER MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/10">
              <div>
                <h3 className="font-extrabold text-lg text-brand-black">Select Poster for Trending</h3>
                <p className="text-xs text-black/50">Pick from catalog ({items.length} selected)</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-brand-smoke transition-colors"><X size={18} /></button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {availableToAdd.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addProduct(p)}
                  className="w-full flex items-center gap-3.5 p-3 rounded-2xl hover:bg-brand-yellow/15 border border-black/5 hover:border-brand-yellow transition-all text-left group"
                >
                  <img src={imgSrc(p.images?.[0])} className="w-10 h-13 object-contain bg-white rounded-xl border border-black/10 shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold text-brand-black truncate group-hover:text-brand-gold">{p.name}</p>
                    <p className="text-[11px] text-black/45">★ {p.rating || 5.0}</p>
                  </div>
                  <Plus size={16} className="text-brand-black opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}

              {availableToAdd.length === 0 && (
                <p className="text-center text-xs font-bold text-black/40 py-8">All available posters are already in the trending list.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
