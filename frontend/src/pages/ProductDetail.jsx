import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Heart, Minus, Plus, MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useSettings } from '../hooks/useSettings'
import { useProduct } from '../hooks/useProducts'

const defaultSizePrices = {
  A5: 259,
  A4: 319,
  A3: 399,
  '12x18': 499,
  '18x24': 699,
  '24x36': 997,
}

const defaultPosterReviews = [
  { id: 'd1', name: 'Ananya R.', rating: 5, text: 'Vibrant colors, super crisp detail!', date: '2 days ago' },
  { id: 'd2', name: 'Karthik M.', rating: 5, text: 'Top tier print quality. Very satisfied!', date: '1 week ago' },
  { id: 'd3', name: 'Priya S.', rating: 4, text: '', date: '2 weeks ago' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const { product: fetched } = useProduct(id)

  const product = {
    sizes: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'],
    images: ['https://picsum.photos/seed/fallback/800/1100'],
    price: 399,
    rating: 4.8,
    reviewsCount: 14,
    ...fetched,
  }

  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [selectedSize, setSelectedSize] = useState('A3')
  const [quantity, setQuantity] = useState(1)

  // Reviews state for this specific poster
  const [posterReviews, setPosterReviews] = useState(defaultPosterReviews)
  const [submittingReview, setSubmittingReview] = useState(false)

  const [newRating, setNewRating] = useState(5)
  const [newReviewText, setNewReviewText] = useState('')
  const [newReviewerName, setNewReviewerName] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch reviews from backend for this poster
  useEffect(() => {
    setSelectedSize('A3')
    setQuantity(1)
    if (!id) return

    api.get(`/reviews/product/${id}`)
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((r) => ({
            id: r._id,
            name: r.name,
            rating: r.rating,
            text: r.text || '',
            date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          }))
          setPosterReviews(formatted)
        } else {
          setPosterReviews(defaultPosterReviews)
        }
      })
      .catch(() => {
        setPosterReviews(defaultPosterReviews)
      })
  }, [id, product._id])

  const { settings } = useSettings()

  let activeSizePrices = defaultSizePrices
  if (settings?.sizePrices && typeof settings.sizePrices === 'object') {
    activeSizePrices = { ...defaultSizePrices, ...settings.sizePrices }
  } else {
    try {
      const saved = localStorage.getItem('ws_size_prices')
      if (saved) activeSizePrices = { ...defaultSizePrices, ...JSON.parse(saved) }
    } catch {}
  }

  const currentPrice = activeSizePrices[selectedSize] || 399

  const handleAddToCart = () => {
    addToCart(
      { ...product, price: currentPrice },
      { size: selectedSize, quantity }
    )
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!newReviewerName.trim()) {
      return toast.error('Please enter your name')
    }

    setSubmittingReview(true)
    const reviewData = {
      product: id || product._id,
      name: newReviewerName.trim(),
      rating: newRating,
      text: newReviewText.trim(),
    }

    try {
      const { data } = await api.post('/reviews', reviewData)
      const newObj = {
        id: data._id || Date.now(),
        name: data.name,
        rating: data.rating,
        text: data.text || '',
        date: 'Just now'
      }
      setPosterReviews([newObj, ...posterReviews.filter(r => !String(r.id).startsWith('d'))])
      toast.success('Thank you for rating this poster!')
      setNewReviewText('')
      setNewReviewerName('')
      setShowReviewForm(false)
    } catch {
      // Fallback for offline demo mode
      const newObj = {
        id: Date.now(),
        name: newReviewerName.trim(),
        rating: newRating,
        text: newReviewText.trim(),
        date: 'Just now'
      }
      setPosterReviews([newObj, ...posterReviews])
      toast.success('Thank you for rating this poster!')
      setNewReviewText('')
      setNewReviewerName('')
      setShowReviewForm(false)
    } finally {
      setSubmittingReview(false)
    }
  }

  // Calculate updated average rating
  const totalReviewCount = posterReviews.length
  const avgRating = (
    posterReviews.reduce((sum, r) => sum + r.rating, 0) / (totalReviewCount || 1)
  ).toFixed(1)

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
        {/* MAIN POSTER IMAGE (ONLY SINGLE IMAGE) */}
        <div>
          <div className="rounded-3xl overflow-hidden bg-brand-smoke aspect-[4/5] shadow-card border border-black/5">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* POSTER DETAILS & SELECTION */}
        <div>
          {/* POSTER NAME */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-3 leading-tight">
            {product.name}
          </h1>

          {/* RATING DISPLAY */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(Number(avgRating)) ? '#FFD000' : 'none'}
                  stroke={i < Math.round(Number(avgRating)) ? '#FFD000' : '#ccc'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-black/70">
              {avgRating} <span className="text-black/40 font-normal">({totalReviewCount} reviews)</span>
            </span>
          </div>

          {/* DYNAMIC PRICE BASED ONLY ON SIZE */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-brand-black">₹{currentPrice}</span>
              <span className="text-xs text-black/40 font-semibold uppercase tracking-wider">
                for size {selectedSize}
              </span>
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mb-8">
            <label className="block font-bold text-sm text-black/80 mb-3 uppercase tracking-wider">
              Select Size
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {product.sizes.map((s) => {
                const sizePrice = activeSizePrices[s] || 399
                const isSelected = selectedSize === s
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-md'
                        : 'bg-white border-black/10 hover:border-black/30 text-black/80'
                    }`}
                  >
                    <span>{s}</span>
                    <span className={`text-[11px] font-semibold ${isSelected ? 'text-brand-yellow/80' : 'text-black/45'}`}>
                      ₹{sizePrice}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* QUANTITY & WISHLIST BUTTON */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-black/10 rounded-full bg-brand-smoke p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-9 text-center font-extrabold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-full border-2 transition-colors ${
                isWishlisted(product._id)
                  ? 'bg-brand-yellow border-brand-yellow text-brand-black'
                  : 'border-black/10 hover:border-black/30 text-black/70'
              }`}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={isWishlisted(product._id) ? '#0A0A0A' : 'none'} />
            </button>
          </div>

          {/* ACTION BUTTONS: ADD TO CART & BUY NOW */}
          <div className="flex gap-3 mb-10">
            <button
              onClick={handleAddToCart}
              className="flex-1 border-2 border-brand-black text-brand-black font-extrabold py-4 rounded-2xl hover:bg-brand-smoke transition-colors text-sm"
            >
              Add to Cart
            </button>
            <Link
              to="/checkout"
              onClick={handleAddToCart}
              className="flex-1 bg-brand-black text-brand-yellow font-extrabold py-4 rounded-2xl text-center hover:shadow-glow transition-all text-sm"
            >
              Buy Now
            </Link>
          </div>

          {/* REVIEWS & RATING SECTION FOR THIS POSTER */}
          <div className="border-t border-black/10 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-lg text-brand-black flex items-center gap-2">
                <MessageSquare size={18} /> Poster Reviews ({totalReviewCount})
              </h3>
              <button
                onClick={() => setShowReviewForm((v) => !v)}
                className="text-xs font-bold bg-brand-yellow/20 text-brand-gold px-3.5 py-2 rounded-full hover:bg-brand-yellow/30 transition-colors"
              >
                {showReviewForm ? 'Cancel' : '+ Add Review'}
              </button>
            </div>

            {/* ADD REVIEW FORM */}
            {showReviewForm && (
              <form onSubmit={handleAddReview} className="bg-brand-smoke rounded-2xl p-5 mb-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black/70 mb-2">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="p-1 text-yellow-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={22}
                          fill={star <= newRating ? '#FFD000' : 'none'}
                          stroke={star <= newRating ? '#FFD000' : '#ccc'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 outline-none text-xs font-medium focus:border-brand-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 mb-1">
                    Review Description <span className="font-normal text-black/40">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your thoughts about this poster design..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 outline-none text-xs font-medium focus:border-brand-black resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-brand-black text-brand-yellow font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 hover:shadow-md transition-all disabled:opacity-50"
                >
                  <Send size={14} /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {/* REVIEWS LIST */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {posterReviews.map((r) => (
                <div key={r.id} className="bg-brand-smoke/60 rounded-2xl p-4 border border-black/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-brand-black">{r.name}</span>
                    <span className="text-[10px] text-black/40">{r.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < r.rating ? '#FFD000' : 'none'}
                        stroke={i < r.rating ? '#FFD000' : '#ccc'}
                      />
                    ))}
                  </div>
                  {r.text && (
                    <p className="text-xs text-black/70 leading-relaxed mt-1">{r.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
