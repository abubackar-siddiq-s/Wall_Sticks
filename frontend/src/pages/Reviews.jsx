import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, ArrowLeft, Filter, MessageSquareQuote } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'

export default function Reviews() {
  const { data: rawReviews, loading } = useApiData('/reviews', [])
  const reviews = useMemo(() => (Array.isArray(rawReviews) ? rawReviews : []), [rawReviews])
  const [selectedStar, setSelectedStar] = useState('all')

  // Calculate summary metrics
  const totalReviews = reviews.length
  const avgRating = useMemo(() => {
    if (!totalReviews) return '0.0'
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0)
    return (sum / totalReviews).toFixed(1)
  }, [reviews, totalReviews])

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach((r) => {
      const star = Math.round(Number(r.rating) || 5)
      if (counts[star] !== undefined) counts[star] += 1
    })
    return counts
  }, [reviews])

  const filteredReviews = useMemo(() => {
    if (selectedStar === 'all') return reviews
    return reviews.filter((r) => Math.round(Number(r.rating)) === Number(selectedStar))
  }, [reviews, selectedStar])

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      {/* HEADER NAV */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-black/50 hover:text-black mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Customer Reviews</h1>
        <p className="text-black/60 text-sm md:text-base mt-2">
          Read genuine feedback and experiences from wall art lovers across India.
        </p>
      </div>

      {/* SUMMARY METRICS CARD */}
      <div className="bg-brand-smoke rounded-xl2 p-6 md:p-8 mb-10 grid md:grid-cols-[220px_1fr] gap-8 items-center border border-black/5 shadow-soft">
        <div className="text-center md:border-r border-black/10 md:pr-8">
          <div className="text-5xl font-extrabold text-brand-black mb-2">{avgRating}</div>
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(Number(avgRating)) ? '#FFD000' : 'none'}
                stroke={i < Math.round(Number(avgRating)) ? '#FFD000' : '#ccc'}
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-black/50">Based on {totalReviews} verified reviews</p>
        </div>

        {/* STAR RATING BREAKDOWN */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0
            const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-black/70 flex items-center gap-1">
                  {star} <Star size={12} fill="#FFD000" stroke="#FFD000" />
                </span>
                <div className="flex-1 h-2.5 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-yellow rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-12 text-right font-medium text-black/40">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap items-center gap-2.5 mb-8 pb-4 border-b border-black/10">
        <span className="text-xs font-bold uppercase tracking-wider text-black/40 mr-2 flex items-center gap-1">
          <Filter size={14} /> Filter:
        </span>
        <button
          onClick={() => setSelectedStar('all')}
          className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
            selectedStar === 'all'
              ? 'bg-brand-black text-brand-yellow shadow-sm'
              : 'bg-brand-smoke text-black/70 hover:bg-black/10'
          }`}
        >
          All Reviews ({totalReviews})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingCounts[star] || 0
          const isSelected = selectedStar === String(star)
          return (
            <button
              key={star}
              onClick={() => setSelectedStar(String(star))}
              className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-brand-black text-brand-yellow shadow-sm'
                  : 'bg-brand-smoke text-black/70 hover:bg-black/10'
              }`}
            >
              {star} Stars <Star size={12} fill={isSelected ? '#FFD000' : '#888'} stroke="none" /> ({count})
            </button>
          )
        })}
      </div>

      {/* REVIEWS GRID */}
      {loading ? (
        <div className="grid md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-brand-smoke rounded-xl2 h-44 animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-5">
          {filteredReviews.map((r) => (
            <div key={r.id || r._id} className="bg-white rounded-xl2 p-6 shadow-soft border border-black/5 hover:shadow-card transition-shadow">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={15}
                    fill={i < r.rating ? '#FFD000' : 'none'}
                    stroke={i < r.rating ? '#FFD000' : '#ccc'}
                  />
                ))}
              </div>
              <p className="text-sm text-black/80 mb-5 leading-relaxed font-medium">"{r.text}"</p>
              <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold text-brand-black">{r.name}</p>
                  <p className="text-[11px] text-black/45">{r.product || 'WallSticks Poster'}</p>
                </div>
                {r.createdAt && (
                  <span className="text-[10px] text-black/35 font-medium">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-smoke rounded-xl3 border border-black/5">
          <MessageSquareQuote size={40} className="mx-auto text-black/30 mb-3" />
          <h3 className="text-lg font-extrabold text-brand-black mb-1">No reviews found</h3>
          <p className="text-xs text-black/50">There are no {selectedStar}-star reviews yet.</p>
        </div>
      )}
    </div>
  )
}
