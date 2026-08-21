import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { responsiveImgProps } from '../lib/imageUrl'

export default function ProductCard({ product, onQuickView, showPrice = false }) {
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToCart } = useCart()
  const wishlisted = isWishlisted(product._id)
  const hasSecondaryImage = product.images && product.images.length > 1

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group/card relative bg-white rounded-xl2 overflow-hidden shadow-soft hover:shadow-card transition-all border border-black/5 hover:border-black/15"
    >
      <Link 
        to={`/product/${product._id}`} 
        className="block relative w-full overflow-hidden aspect-[3/4]"
        style={{ 
          aspectRatio: '3 / 4',
          backgroundImage: "url('/transparent-background.avif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Primary Image */}
        <img
          {...responsiveImgProps(product.images?.[0], { sizes: '(max-width: 640px) 50vw, 25vw' })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain"
        />

        {product.bestSeller && (
          <span className="absolute top-3 left-3 bg-brand-yellow text-brand-black text-[11px] font-bold px-2.5 py-1 rounded-full z-10">
            Best Seller
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            wishlisted ? 'bg-brand-yellow text-brand-black' : 'bg-white/90 text-black hover:bg-white'
          }`}
        >
          <Heart size={16} fill={wishlisted ? '#0A0A0A' : 'none'} />
        </button>

        {/* Individual Card Quick Action overlay on card hover */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product) }}
            className="flex-1 bg-white/95 text-black text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 hover:bg-white shadow-sm"
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product) }}
            className="flex-1 bg-brand-black text-brand-yellow text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-sm hover:bg-black"
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </Link>

      <div className="p-3.5 flex flex-col justify-between flex-1">
        <Link to={`/product/${product._id}`} className="font-bold text-sm text-brand-black truncate hover:underline mb-1">
          {product.name}
        </Link>
        <div className="flex items-center justify-between">
          {showPrice && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-sm text-brand-black">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-black/40 line-through">₹{product.mrp}</span>
              )}
            </div>
          )}
          {product.reviewsCount > 0 && (
            <div className={`flex items-center gap-1 text-xs text-black/60 font-medium ${!showPrice ? 'ml-auto' : ''}`}>
              <Star size={12} fill="#FFD000" stroke="#FFD000" />
              <span>{product.rating}</span>
              <span className="text-black/35">({product.reviewsCount})</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

