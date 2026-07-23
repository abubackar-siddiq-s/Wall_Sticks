import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'

export default function Wishlist() {
  const { items, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-smoke flex items-center justify-center mx-auto mb-6">
          <Heart size={28} className="text-black/30" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Your wishlist is empty</h1>
        <p className="text-black/50 mb-8">Save posters you love and come back to them anytime.</p>
        <Link to="/shop" className="inline-block bg-brand-black text-brand-yellow font-bold px-7 py-3.5 rounded-full">Browse Posters</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">My Wishlist <span className="text-black/40 font-medium text-xl">({items.length})</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {items.map((product) => (
          <div key={product._id} className="bg-white rounded-xl2 overflow-hidden shadow-soft">
            <Link to={`/product/${product._id}`} className="block aspect-[4/5] bg-brand-smoke">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </Link>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
              <p className="font-bold mb-3">₹{product.price}</p>
              <div className="flex gap-2">
                <button onClick={() => addToCart(product)} className="flex-1 bg-brand-black text-brand-yellow text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5">
                  <ShoppingBag size={13} /> Move to Cart
                </button>
                <button onClick={() => removeFromWishlist(product._id)} aria-label="Remove" className="p-2.5 rounded-full border border-black/10 hover:bg-red-50 hover:border-red-200 text-black/40 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
