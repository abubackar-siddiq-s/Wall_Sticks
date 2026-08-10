import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Heart, Minus, Plus, MessageSquare, Send, Trash2, ChevronLeft, ChevronRight, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useSettings } from '../hooks/useSettings'
import { useProduct } from '../hooks/useProducts'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useAuth } from '../context/AuthContext'
import { responsiveImgProps } from '../lib/imageUrl'
import ColorPickerModal from '../components/ColorPickerModal'

const defaultSizePrices = {
  A5: 259,
  A4: 319,
  A3: 399,
  '12x18': 499,
  '18x24': 699,
  '24x36': 997,
}

export default function ProductDetail() {
  const { id } = useParams()
  const { product: fetched } = useProduct(id)

  const product = {
    sizes: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'],
    images: [],
    price: 399,
    rating: 0,
    reviewsCount: 0,
    ...fetched,
  }

  const [selectedImgIndex, setSelectedImgIndex] = useState(0)
  const imagesList = Array.isArray(product.images) && product.images.length > 0 ? product.images : []

  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { customer, isCustomerLoggedIn, openLoginModal } = useCustomerAuth()
  const { isAuthenticated: isAdmin } = useAuth() || {}

  const [deletingId, setDeletingId] = useState(null)

  const handleDeleteReview = async (e, reviewId, reviewerName) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const targetId = reviewId
    if (!targetId || deletingId === targetId) return

    if (!window.confirm(`Delete review by ${reviewerName || 'customer'}?`)) return

    setDeletingId(targetId)
    try {
      await api.delete(`/reviews/${targetId}`)
      toast.success('Review deleted successfully')
      setPosterReviews((prev) => prev.filter((r) => (r.id || r._id) !== targetId))
    } catch (err) {
      if (err?.response?.status === 404) {
        // Silently treat 404 as already deleted
        setPosterReviews((prev) => prev.filter((r) => (r.id || r._id) !== targetId))
      } else {
        toast.error(err?.response?.data?.message || 'Could not delete review')
      }
    } finally {
      setDeletingId(null)
    }
  }

  const [selectedSize, setSelectedSize] = useState('A3')
  const [quantity, setQuantity] = useState(1)
  const [isLandscape, setIsLandscape] = useState(false)

  // Border Selection State & Notes
  const [selectedBorder, setSelectedBorder] = useState('No Border')
  const [customBorderColor, setCustomBorderColor] = useState('#C1272D')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setIsLandscape(false)
  }, [id])

  // Reviews state for this specific poster
  const [posterReviews, setPosterReviews] = useState([])
  const [submittingReview, setSubmittingReview] = useState(false)

  const [newRating, setNewRating] = useState(5)
  const [newReviewText, setNewReviewText] = useState('')
  const [newReviewerName, setNewReviewerName] = useState('')
  const [showReviewForm, setShowReviewForm] = useState(false)

  const handleToggleReviewForm = () => {
    if (!isCustomerLoggedIn) {
      toast('Please login to leave a review', { icon: '🔒' })
      openLoginModal()
      return
    }
    if (!showReviewForm && !newReviewerName) {
      setNewReviewerName(customer?.name || customer?.email || customer?.phone || '')
    }
    setShowReviewForm((v) => !v)
  }

  // Fetch reviews from backend for this poster
  useEffect(() => {
    setSelectedSize('A3')
    setQuantity(1)
    if (!id) return

    api.get(`/reviews/product/${id}`)
      .then(({ data }) => {
        if (Array.isArray(data)) {
          const formatted = data.map((r) => ({
            id: r._id,
            name: r.name,
            rating: r.rating,
            text: r.text || '',
            date: new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          }))
          setPosterReviews(formatted)
        } else {
          setPosterReviews([])
        }
      })
      .catch(() => {
        setPosterReviews([])
      })
  }, [id, product._id])

  const { settings } = useSettings()

  const activeSizePrices = (settings?.sizePrices && typeof settings.sizePrices === 'object')
    ? settings.sizePrices
    : defaultSizePrices

  const availableSizes = Array.from(new Set([
    ...Object.keys(activeSizePrices),
    ...(product.sizes || []),
  ])).filter((s) => activeSizePrices[s] !== undefined)

  const currentPrice = activeSizePrices[selectedSize] || 399

  const handleAddToCart = () => {
    const borderLabel = selectedBorder === 'Custom Border' ? `Custom Border (${customBorderColor})` : selectedBorder
    const colorHex = selectedBorder === 'Custom Border' ? customBorderColor : selectedBorder === 'White Border' ? '#FFFFFF' : ''

    addToCart(
      { ...product, price: currentPrice },
      { size: selectedSize, quantity, border: borderLabel, borderColor: colorHex, notes: notes.trim() }
    )
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!isCustomerLoggedIn) {
      toast('Please login to leave a review', { icon: '🔒' })
      openLoginModal()
      return
    }

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
      setPosterReviews([newObj, ...posterReviews])
      toast.success('Thank you for rating this poster!')
      setNewReviewText('')
      setNewReviewerName('')
      setShowReviewForm(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not submit review')
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
        {/* MAIN POSTER IMAGE & THUMBNAILS (AMAZON STYLE GALLERY) */}
        <div className="flex flex-col gap-4">
          <div 
            className="relative rounded-3xl overflow-hidden shadow-card border border-black/5 group w-full aspect-[3/4] transition-all duration-300 flex items-center justify-center"
            style={{ 
              aspectRatio: '3 / 4',
              backgroundColor: selectedBorder === 'White Border' ? '#FFFFFF' : selectedBorder === 'Custom Border' ? customBorderColor : 'transparent',
              padding: selectedBorder === 'No Border' ? '0px' : '16px',
            }}
          >
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              <img
                {...responsiveImgProps(imagesList[selectedImgIndex] || product.images?.[0], { sizes: '(max-width: 768px) 100vw, 50vw' })}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedImgIndex((prev) => (prev > 0 ? prev - 1 : imagesList.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-black/10 flex items-center justify-center text-black hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImgIndex((prev) => (prev < imagesList.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md border border-black/10 flex items-center justify-center text-black hover:bg-white hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* THUMBNAIL GALLERY STRIP */}
          {imagesList.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 [scrollbar-width:none]">
              {imagesList.map((imgObj, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative w-[60px] h-[80px] rounded-xl overflow-hidden bg-white border-2 transition-all shrink-0 aspect-[3/4] ${
                    selectedImgIndex === idx
                      ? 'border-brand-black shadow-md scale-105 ring-2 ring-brand-yellow/50'
                      : 'border-black/10 opacity-60 hover:opacity-100 hover:border-black/30'
                  }`}
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <img
                    {...responsiveImgProps(imgObj, { sizes: '64px' })}
                    alt={`${product.name} view ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* POSTER DETAILS & SELECTION */}
        <div>
          {/* POSTER NAME */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-3 leading-tight">
            {product.name}
          </h1>

          {/* RATING DISPLAY */}
          {totalReviewCount > 0 ? (
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
                {avgRating} <span className="text-black/40 font-normal">({totalReviewCount} {totalReviewCount === 1 ? 'review' : 'reviews'})</span>
              </span>
            </div>
          ) : (
            <p className="text-xs text-black/40 mb-6 italic">No reviews yet for this poster.</p>
          )}

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
              {availableSizes.map((s) => {
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
          {/* BORDER SELECTOR (NO BORDER, WHITE BORDER, CUSTOM BORDER WITH COLOR PICKER) */}
          <div className="mb-8">
            <label className="block font-bold text-sm text-black/80 mb-3 uppercase tracking-wider">
              Select Border Option
            </label>
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {[
                { id: 'No Border', label: 'No Border' },
                { id: 'White Border', label: 'White Border' },
                { id: 'Custom Border', label: 'Custom Border' },
              ].map((b) => {
                const isSelected = selectedBorder === b.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBorder(b.id)}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-md'
                        : 'bg-white border-black/10 hover:border-black/30 text-black/80'
                    }`}
                  >
                    {b.id === 'Custom Border' && (
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/50 shrink-0 inline-block shadow-sm"
                        style={{ backgroundColor: customBorderColor }}
                      />
                    )}
                    <span>{b.label}</span>
                  </button>
                )
              })}
            </div>

            {/* CUSTOM COLOR PICKER CONTROL BAR */}
            {selectedBorder === 'Custom Border' && (
              <div className="flex items-center justify-between bg-brand-smoke rounded-2xl p-3 border border-black/10">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-7 h-7 rounded-xl border-2 border-black/20 shadow-sm shrink-0" 
                    style={{ backgroundColor: customBorderColor }} 
                  />
                  <div>
                    <p className="text-xs font-extrabold text-brand-black">Custom Border Color</p>
                    <p className="text-[11px] font-mono text-black/50 font-bold uppercase">{customBorderColor}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowColorPicker(true)}
                  className="bg-white hover:bg-black/5 text-brand-black font-extrabold px-3.5 py-2 rounded-xl text-xs border border-black/15 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Palette size={14} className="text-brand-gold" /> Color Picker
                </button>
              </div>
            )}
          </div>

          {/* SPECIAL INSTRUCTIONS / NOTES */}
          <div className="mb-8">
            <label className="block font-bold text-sm text-black/80 mb-2 uppercase tracking-wider">
              Special Instructions / Notes <span className="font-normal text-black/40 text-xs font-sans">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. crop tightly on the left, brighten slightly, or add custom gift note..."
              className="w-full px-4 py-3 rounded-2xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-xs font-medium resize-none transition-colors"
            />
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
                onClick={handleToggleReviewForm}
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
            {posterReviews.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {posterReviews.map((r) => (
                  <div key={r.id} className="bg-brand-smoke/60 rounded-2xl p-4 border border-black/5 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
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
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteReview(e, r.id || r._id, r.name)}
                        disabled={deletingId === (r.id || r._id)}
                        className="p-1.5 rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                        title="Delete Review (Admin)"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center bg-brand-smoke/50 rounded-2xl border border-black/5">
                <p className="text-xs text-black/50 font-medium mb-1">No reviews yet for this poster.</p>
                <p className="text-[11px] text-black/40">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showColorPicker && (
        <ColorPickerModal
          initialColor={customBorderColor}
          posterImage={imagesList[selectedImgIndex] || product.images?.[0]}
          posterName={product.name}
          onSelectColor={(color) => setCustomBorderColor(color)}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  )
}
