import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Sparkles, Tag, Award, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/trending', label: 'Trending', icon: Sparkles },
  { to: '/admin/best-sellers', label: 'Best Sellers', icon: Award },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/size-pricing', label: 'Size Pricing', icon: Tag },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-brand-smoke flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-brand-black text-white px-5 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="WallSticks Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-extrabold text-md">WallSticks</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-1 rounded-md hover:bg-white/10" aria-label="Open navigation menu">
          <Menu size={20} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-brand-black text-white shrink-0 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2.5 mb-10">
          <img src="/logo.jpeg" alt="WallSticks Logo" className="w-9 h-9 object-contain rounded-xl" />
          <span className="font-extrabold text-lg">WallSticks</span>
        </div>
        <nav className="flex-1 space-y-1.5">
          {nav.map((n) => (
            <NavLink
              key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-yellow text-brand-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              <n.icon size={17} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => { logout(); navigate('/admin/login') }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Log Out
        </button>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute left-0 top-0 bottom-0 w-64 bg-brand-black text-white p-6 flex flex-col z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-brand-yellow flex items-center justify-center">
                    <span className="text-brand-black font-extrabold text-sm leading-none">W</span>
                  </span>
                  <span className="font-extrabold text-md">WallSticks</span>
                </div>
                <button onClick={() => setMobileOpen(false)} aria-label="Close navigation menu" className="p-1 rounded-md hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 space-y-1.5">
                {nav.map((n) => (
                  <NavLink
                    key={n.to} to={n.to} end={n.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-brand-yellow text-brand-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                  >
                    <n.icon size={17} /> {n.label}
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={() => { logout(); navigate('/admin/login'); setMobileOpen(false) }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
              >
                <LogOut size={17} /> Log Out
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-8">{title}</h1>
        {children}
      </main>
    </div>
  )
}
