import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Menu, X, Search, Package } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { items } = useCart()
  const { items: wishItems } = useWishlist()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-soft' : 'bg-white/95'}`}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-9 h-9 rounded-xl2 bg-brand-black flex items-center justify-center">
            <span className="text-brand-yellow font-extrabold text-lg leading-none">P</span>
          </span>
          <span className="font-extrabold text-xl tracking-tight">Poster<span className="text-brand-yellow" style={{ WebkitTextStroke: '1px #0A0A0A' }}>Wall</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative text-sm font-semibold tracking-wide transition-colors ${isActive ? 'text-brand-black' : 'text-black/50 hover:text-black'}`
              }
            >
              {({ isActive }) => (
                <span className="relative pb-1">
                  {l.label}
                  {isActive && (
                    <motion.span layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-[3px] bg-brand-yellow rounded-full" />
                  )}
                </span>
              )}
            </NavLink>
          ))}
          <Link
            to="/create-your-own"
            className="text-sm font-bold bg-brand-black text-brand-yellow px-5 py-2.5 rounded-full hover:shadow-glow transition-shadow"
          >
            Create Your Own
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 md:gap-3">
          <button aria-label="Search" className="p-2.5 rounded-full hover:bg-brand-smoke transition-colors hidden sm:flex">
            <Search size={20} />
          </button>
          <Link aria-label="Wishlist" to="/wishlist" className="p-2.5 rounded-full hover:bg-brand-smoke transition-colors relative">
            <Heart size={20} />
            {wishItems.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-brand-yellow rounded-full text-[10px] font-bold flex items-center justify-center">{wishItems.length}</span>
            )}
          </Link>
          <Link aria-label="My orders" to="/my-orders" className="p-2.5 rounded-full hover:bg-brand-smoke transition-colors hidden sm:flex">
            <Package size={20} />
          </Link>
          <Link aria-label="Cart" to="/cart" className="p-2.5 rounded-full hover:bg-brand-smoke transition-colors relative">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-4 h-4 bg-brand-yellow rounded-full text-[10px] font-bold flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          <button className="lg:hidden p-2.5 rounded-full hover:bg-brand-smoke" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white p-6 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end">
                <button onClick={() => setOpen(false)} aria-label="Close menu"><X size={24} /></button>
              </div>
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-lg font-semibold">
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/my-orders" onClick={() => setOpen(false)} className="text-lg font-semibold">My Orders</NavLink>
              <Link to="/create-your-own" onClick={() => setOpen(false)} className="text-center font-bold bg-brand-black text-brand-yellow px-5 py-3 rounded-full">
                Create Your Own
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
