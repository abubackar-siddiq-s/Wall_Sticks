import { useEffect, useState } from 'react'
import { GripVertical, X, Plus, Sparkles, Award, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'

export default function AdminBestSellers() {
  const [bestSellers, setBestSellers] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [dragIndex, setDragIndex] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => {
        const prodData = data.products || data
        if (Array.isArray(prodData)) {
          setAllProducts(prodData)
          const filteredBs = prodData.filter((p) => p.bestSeller)
          setBestSellers(filteredBs)
        }
      })
      .catch(() => {})
  }, [])

  const onDragStart = (i) => () => setDragIndex(i)
  const onDragOver = (i) => (e) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    setBestSellers((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIndex(i)
  }
  const onDragEnd = () => setDragIndex(null)

  const addBestSeller = async (product) => {
    if (bestSellers.some((p) => p._id === product._id)) {
      return toast.error('Poster is already in Best Sellers')
    }

    try {
      await api.put(`/products/${product._id}`, { bestSeller: true })
      setBestSellers((prev) => [...prev, { ...product, bestSeller: true }])
      setShowAdd(false)
      toast.success('Marked as Best Seller!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update poster')
    }
  }

  const removeBestSeller = async (id) => {
    try {
      await api.put(`/products/${id}`, { bestSeller: false })
      setBestSellers((prev) => prev.filter((p) => p._id !== id))
      toast.success('Removed from Best Sellers')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update poster')
    }
  }

  const saveBestSellers = async () => {
    if (bestSellers.length < 5) {
      toast.error(`Please select at least 5 Best Seller posters (currently ${bestSellers.length}).`)
    } else {
      toast.success('Best Sellers selection saved!')
    }
  }

  const availableToAdd = allProducts.filter(
    (p) => !bestSellers.some((b) => b._id === p._id)
  )

  const isCountValid = bestSellers.length >= 5

  return (
    <AdminLayout title="Best Seller Posters Management">
      {/* STATUS & CONTROLS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg text-brand-black flex items-center gap-2">
              <Award size={20} className="text-amber-500" /> Best Sellers Catalog Control
            </h2>
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isCountValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isCountValid ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
              {bestSellers.length} Selected (Min: 5, Max: Unlimited)
            </span>
          </div>
          <p className="text-xs text-black/50 mt-0.5">
            Manage posters that feature the "Best Seller" badge in store collections. Add unlimited posters (Minimum 5 required).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-white border-2 border-black/10 hover:border-brand-black font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
          >
            <Plus size={16} /> Add Best Seller
          </button>

          <button
            onClick={saveBestSellers}
            className="bg-brand-black text-brand-yellow font-extrabold px-5 py-2.5 rounded-xl text-xs hover:shadow-md transition-all flex items-center gap-1.5"
          >
            <Sparkles size={14} /> Save Selection
          </button>
        </div>
      </div>

      {/* BEST SELLERS LIST */}
      <div className="space-y-3 max-w-2xl">
        {bestSellers.map((p, i) => (
          <div
            key={p._id}
            draggable
            onDragStart={onDragStart(i)}
            onDragOver={onDragOver(i)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-3.5 bg-white rounded-2xl p-3.5 shadow-soft border border-black/5 cursor-grab active:cursor-grabbing hover:border-brand-black/30 transition-all ${
              dragIndex === i ? 'opacity-40 bg-brand-smoke' : ''
            }`}
          >
            <GripVertical size={18} className="text-black/30 shrink-0" />
            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center text-xs font-extrabold shrink-0">
              #{i + 1}
            </span>
            <img
              src={imgSrc(p.images?.[0])}
              className="w-10 h-13 object-contain bg-white rounded-xl border border-black/10 shrink-0"
              alt=""
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-brand-black truncate">{p.name}</p>
              <div className="flex items-center gap-2 text-xs text-black/45 mt-0.5">
                <span className="text-amber-600 font-bold">★ {p.rating || 5.0}</span>
              </div>
            </div>

            <button
              onClick={() => removeBestSeller(p._id)}
              className="p-2 rounded-xl hover:bg-red-50 text-black/30 hover:text-red-500 transition-colors"
              title="Remove Best Seller status"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {bestSellers.length === 0 && (
          <div className="text-center bg-white rounded-2xl p-12 border border-black/5">
            <p className="text-sm font-bold text-black/40">No Best Seller posters selected.</p>
            <p className="text-xs text-black/30 mt-1">Add at least 5 posters to highlight as Best Sellers.</p>
          </div>
        )}
      </div>

      {/* ADD BEST SELLER MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[80vh] flex flex-col shadow-card" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/10">
              <div>
                <h3 className="font-extrabold text-lg text-brand-black">Select Best Seller Poster</h3>
                <p className="text-xs text-black/50">Pick from catalog ({bestSellers.length} selected)</p>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-full hover:bg-brand-smoke transition-colors"><X size={18} /></button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {availableToAdd.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addBestSeller(p)}
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
                <p className="text-center text-xs font-bold text-black/40 py-8">All posters in catalog are already marked as Best Sellers.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
