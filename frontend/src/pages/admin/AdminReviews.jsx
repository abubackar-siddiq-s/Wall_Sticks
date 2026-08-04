import { useState, useEffect } from 'react'
import { Star, Trash2, Search, Filter, MessageSquare, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { useApiData } from '../../hooks/useApiData'
import api from '../../lib/api'

export default function AdminReviews() {
  const { data: rawReviews, loading, mutate } = useApiData('/reviews', [])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (Array.isArray(rawReviews)) {
      setReviews(rawReviews)
    }
  }, [rawReviews])

  const [search, setSearch] = useState('')
  const [starFilter, setStarFilter] = useState('all')
  const [deletingId, setDeletingId] = useState(null)

  const filteredReviews = reviews.filter((r) => {
    const matchesStar = starFilter === 'all' || Math.round(Number(r.rating)) === Number(starFilter)
    const matchesSearch =
      !search.trim() ||
      (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.product || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.text || '').toLowerCase().includes(search.toLowerCase())

    return matchesStar && matchesSearch
  })

  const handleDelete = async (e, id, name) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!id || deletingId === id) return

    if (!window.confirm(`Are you sure you want to delete the review by "${name}"?`)) {
      return
    }

    setDeletingId(id)
    try {
      await api.delete(`/reviews/${id}`)
      toast.success('Review deleted successfully')
      setReviews((prev) => prev.filter((r) => (r.id || r._id) !== id))
      mutate?.()
    } catch (err) {
      if (err?.response?.status === 404) {
        setReviews((prev) => prev.filter((r) => (r.id || r._id) !== id))
        mutate?.()
      } else {
        toast.error(err?.response?.data?.message || 'Could not delete review')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout title="Customer Reviews">
      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/5">
          <p className="text-xs text-black/50 font-bold uppercase tracking-wider mb-1">Total Reviews</p>
          <p className="text-3xl font-extrabold text-brand-black">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/5">
          <p className="text-xs text-black/50 font-bold uppercase tracking-wider mb-1">Average Rating</p>
          <p className="text-3xl font-extrabold text-brand-black flex items-center gap-1.5">
            {reviews.length ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1) : '0.0'}
            <Star size={20} fill="#FFD000" stroke="#FFD000" />
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/5">
          <p className="text-xs text-black/50 font-bold uppercase tracking-wider mb-1">5-Star Ratings</p>
          <p className="text-3xl font-extrabold text-brand-black">
            {reviews.filter((r) => Math.round(Number(r.rating)) === 5).length}
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-5 shadow-soft border border-black/5 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search customer, poster, or comment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-brand-smoke rounded-xl text-xs font-medium border border-black/5 focus:border-brand-black outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-black/40 mr-1 flex items-center gap-1">
            <Filter size={13} /> Filter:
          </span>
          <button
            onClick={() => setStarFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              starFilter === 'all' ? 'bg-brand-black text-brand-yellow' : 'bg-brand-smoke text-black/60 hover:bg-black/10'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = reviews.filter((r) => Math.round(Number(r.rating)) === s).length
            return (
              <button
                key={s}
                onClick={() => setStarFilter(String(s))}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  starFilter === String(s) ? 'bg-brand-black text-brand-yellow' : 'bg-brand-smoke text-black/60 hover:bg-black/10'
                }`}
              >
                {s}★ ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* REVIEWS TABLE / LIST */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse shadow-soft" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-soft border border-black/5">
          <MessageSquare size={36} className="mx-auto text-black/25 mb-3" />
          <p className="font-bold text-brand-black text-sm mb-1">No reviews found</p>
          <p className="text-xs text-black/45">No customer reviews match your search or filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id || r._id}
              className="bg-white rounded-2xl p-5 shadow-soft border border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="font-extrabold text-sm text-brand-black">{r.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-smoke text-black/60 font-semibold">
                    Poster: {r.product || 'WallSticks Poster'}
                  </span>
                  {r.createdAt && (
                    <span className="text-[11px] text-black/40 font-medium">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < r.rating ? '#FFD000' : 'none'}
                      stroke={i < r.rating ? '#FFD000' : '#ccc'}
                    />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-black/70">{r.rating}/5</span>
                </div>

                {r.text ? (
                  <p className="text-xs text-black/70 leading-relaxed font-medium bg-brand-smoke/50 p-3 rounded-xl">
                    "{r.text}"
                  </p>
                ) : (
                  <p className="text-xs text-black/35 italic">No comment provided</p>
                )}
              </div>

              <button
                onClick={(e) => handleDelete(e, r.id || r._id, r.name)}
                disabled={deletingId === (r.id || r._id)}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-bold text-xs flex items-center gap-2 transition-all self-end md:self-center disabled:opacity-50 shrink-0"
              >
                <Trash2 size={15} />
                {deletingId === (r.id || r._id) ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
