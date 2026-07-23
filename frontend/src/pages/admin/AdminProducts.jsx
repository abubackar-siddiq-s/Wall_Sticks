import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { products as mockProducts, categories as mockCategories } from '../../data/mockData'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'

const catSlug = (p) => (typeof p.category === 'string' ? p.category : p.category?.slug)

function ProductModal({ product, categories, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', price: '', category: categories[0]?.slug, images: [''], featured: false, bestSeller: false, trending: false })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl2 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-bold text-lg">{product ? 'Edit Poster' : 'Add Poster'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <input value={form.name} onChange={set('name')} placeholder="Poster name" className="w-full px-4 py-3 rounded-xl bg-brand-smoke text-sm outline-none focus:ring-2 focus:ring-brand-yellow" />
          <input value={form.price} onChange={set('price')} type="number" placeholder="Price (₹)" className="w-full px-4 py-3 rounded-xl bg-brand-smoke text-sm outline-none focus:ring-2 focus:ring-brand-yellow" />
          <select value={catSlug(form)} onChange={set('category')} className="w-full px-4 py-3 rounded-xl bg-brand-smoke text-sm outline-none focus:ring-2 focus:ring-brand-yellow">
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input value={form.images?.[0] || ''} onChange={(e) => setForm((f) => ({ ...f, images: [e.target.value] }))} placeholder="Image URL (or upload via Cloudinary in production)" className="w-full px-4 py-3 rounded-xl bg-brand-smoke text-sm outline-none focus:ring-2 focus:ring-brand-yellow" />
          <div className="flex gap-4 text-sm pt-1">
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.featured} onChange={set('featured')} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.bestSeller} onChange={set('bestSeller')} /> Best Seller</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={!!form.trending} onChange={set('trending')} /> Trending</label>
          </div>
        </div>
        <button onClick={() => { onSave(form); onClose() }} className="w-full mt-5 bg-brand-black text-brand-yellow font-bold py-3.5 rounded-full">
          Save Poster
        </button>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const [list, setList] = useState(mockProducts)
  const [categories, setCategories] = useState(mockCategories)
  const [isLive, setIsLive] = useState(false)
  const [modal, setModal] = useState(null) // null | 'new' | product object

  useEffect(() => {
    Promise.all([api.get('/products'), api.get('/categories')])
      .then(([prodRes, catRes]) => {
        setList(prodRes.data.products || prodRes.data)
        setCategories(catRes.data.length ? catRes.data : mockCategories)
        setIsLive(true)
      })
      .catch(() => { setList(mockProducts); setCategories(mockCategories); setIsLive(false) })
  }, [])

  const save = async (form) => {
    const payload = { ...form, price: Number(form.price) }
    if (!isLive) {
      // Local-only fallback so the admin UI is still fully clickable without a backend
      if (payload._id) {
        setList((l) => l.map((p) => p._id === payload._id ? { ...p, ...payload } : p))
      } else {
        setList((l) => [{ ...payload, _id: `p${Date.now()}`, images: payload.images?.length && payload.images[0] ? payload.images : ['https://picsum.photos/seed/new/800/1100'], rating: 5, reviewsCount: 0 }, ...l])
      }
      return toast.success(payload._id ? 'Poster updated (local demo mode)' : 'Poster added (local demo mode)')
    }
    try {
      if (payload._id) {
        const { data } = await api.put(`/products/${payload._id}`, payload)
        setList((l) => l.map((p) => p._id === data._id ? data : p))
        toast.success('Poster updated')
      } else {
        const { data } = await api.post('/products', payload)
        setList((l) => [data, ...l])
        toast.success('Poster added')
      }
    } catch {
      toast.error('Could not save — check the backend connection')
    }
  }

  const remove = async (id) => {
    setList((l) => l.filter((p) => p._id !== id))
    if (!isLive) return toast.success('Poster removed (local demo mode)')
    try {
      await api.delete(`/products/${id}`)
      toast.success('Poster removed')
    } catch {
      toast.error('Could not delete — check the backend connection')
    }
  }

  return (
    <AdminLayout title="Products">
      {!isLive && (
        <p className="text-xs text-black/40 mb-4">Showing demo catalog — connect the backend (see README) to manage live products.</p>
      )}
      <div className="flex justify-between items-center mb-6">
        <p className="text-black/50 text-sm">{list.length} posters</p>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 bg-brand-black text-brand-yellow font-semibold px-5 py-2.5 rounded-full text-sm">
          <Plus size={16} /> Add Poster
        </button>
      </div>

      <div className="bg-white rounded-xl2 shadow-soft overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-black/45 border-b border-black/5">
              <th className="p-4 font-medium">Poster</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Rating</th>
              <th className="p-4 font-medium">Flags</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id} className="border-b border-black/5 last:border-0">
                <td className="p-4 flex items-center gap-3">
                  <img src={imgSrc(p.images[0])} className="w-10 h-12 object-cover rounded-lg" alt="" />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-4 capitalize text-black/60">{typeof p.category === 'string' ? p.category : p.category?.name}</td>
                <td className="p-4 font-semibold">₹{p.price}</td>
                <td className="p-4 flex items-center gap-1"><Star size={13} fill="#FFD000" stroke="#FFD000" /> {p.rating}</td>
                <td className="p-4">
                  <div className="flex gap-1 flex-wrap">
                    {p.featured && <span className="text-[10px] bg-brand-yellow/20 text-brand-gold px-2 py-0.5 rounded-full font-bold">Featured</span>}
                    {p.bestSeller && <span className="text-[10px] bg-brand-yellow/20 text-brand-gold px-2 py-0.5 rounded-full font-bold">Best Seller</span>}
                    {p.trending && <span className="text-[10px] bg-brand-yellow/20 text-brand-gold px-2 py-0.5 rounded-full font-bold">Trending</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setModal(p)} className="p-2 rounded-full hover:bg-brand-smoke"><Pencil size={15} /></button>
                    <button onClick={() => remove(p._id)} className="p-2 rounded-full hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </AdminLayout>
  )
}
