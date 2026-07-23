import { useEffect, useState } from 'react'
import { GripVertical, X, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { products as mockProducts } from '../../data/mockData'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'


// Native HTML5 drag-and-drop reorder — no extra dependency needed for a list this size.
export default function AdminTrending() {
  const [items, setItems] = useState(mockProducts.filter((p) => p.trending).map((p) => ({ _id: p._id, product: p })))
  const [allProducts, setAllProducts] = useState(mockProducts)
  const [isLive, setIsLive] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/trending'), api.get('/products')])
      .then(([trendingRes, prodRes]) => {
        setItems(trendingRes.data)
        setAllProducts(prodRes.data.products || prodRes.data)
        setIsLive(true)
      })
      .catch(() => setIsLive(false))
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
    if (items.some((i) => (i.product?._id || i._id) === product._id)) return toast.error('Already in trending')
    if (!isLive) {
      setItems((prev) => [...prev, { _id: `local-${product._id}`, product }])
      setShowAdd(false)
      return toast.success('Added to trending (local demo mode)')
    }
    try {
      const { data } = await api.post('/trending', { productId: product._id, order: items.length })
      setItems((prev) => [...prev, { ...data, product }])
      setShowAdd(false)
      toast.success('Added to trending')
    } catch {
      toast.error('Could not add to trending — check backend connection')
    }
  }

  const removeItem = async (id) => {
    if (!isLive) {
      setItems((prev) => prev.filter((i) => i._id !== id))
      return toast.success('Removed from trending (local demo mode)')
    }
    try {
      await api.delete(`/trending/${id}`)
      setItems((prev) => prev.filter((i) => i._id !== id))
      toast.success('Removed from trending')
    } catch {
      toast.error('Could not remove — check backend connection')
    }
  }

  const saveOrder = async () => {
    if (!isLive) return toast.success('Order saved (local demo mode — connect the backend to persist)')
    try {
      await api.put('/trending/reorder', { items: items.map((i, order) => ({ id: i._id, order })) })
      toast.success('Trending order saved')
    } catch {
      toast.error('Could not save order — check the backend connection')
    }
  }

  const availableToAdd = allProducts.filter((p) => !items.some((i) => (i.product?._id || i._id) === p._id))

  return (
    <AdminLayout title="Trending Carousel">
      {!isLive && (
        <p className="text-xs text-black/40 mb-4">Editing a local demo list — connect the backend (see README) to persist the homepage carousel.</p>
      )}
      <div className="flex justify-between items-center mb-6">
        <p className="text-black/50 text-sm">Drag to reorder — this is the exact order shown in the homepage "Trending right now" section.</p>
        <div className="flex gap-2">
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-white border-2 border-black/10 font-semibold px-5 py-2.5 rounded-full text-sm">
            <Plus size={16} /> Add Poster
          </button>
          <button onClick={saveOrder} className="bg-brand-black text-brand-yellow font-semibold px-5 py-2.5 rounded-full text-sm">Save Order</button>
        </div>
      </div>

      <div className="space-y-2 max-w-xl">
        {items.map((item, i) => {
          const p = item.product
          return (
            <div
              key={item._id}
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDragEnd={onDragEnd}
              className={`flex items-center gap-3 bg-white rounded-xl2 p-3 shadow-soft cursor-grab active:cursor-grabbing ${dragIndex === i ? 'opacity-50' : ''}`}
            >
              <GripVertical size={16} className="text-black/30 shrink-0" />
              <span className="w-6 text-center text-xs font-bold text-black/40">{i + 1}</span>
              <img src={imgSrc(p?.images?.[0])} className="w-10 h-12 object-cover rounded-lg" alt="" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p?.name}</p>
                <p className="text-xs text-black/45">₹{p?.price}</p>
              </div>
              <button onClick={() => removeItem(item._id)} className="p-2 rounded-full hover:bg-red-50 text-black/30 hover:text-red-500"><X size={15} /></button>
            </div>
          )
        })}
        {items.length === 0 && <p className="text-center text-black/40 py-16 text-sm">No posters in the trending carousel yet.</p>}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-xl2 p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Add to Trending</h3>
              <button onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {availableToAdd.map((p) => (
                <button key={p._id} onClick={() => addProduct(p)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-brand-smoke text-left">
                  <img src={imgSrc(p.images?.[0])} className="w-9 h-11 object-cover rounded-lg" alt="" />
                  <span className="text-sm font-medium truncate">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
