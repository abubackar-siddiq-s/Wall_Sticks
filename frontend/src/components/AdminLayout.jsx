import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Sparkles, Tag, Award, Menu, X, Mail, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../lib/api'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/trending', label: 'Trending', icon: Sparkles },
  { to: '/admin/best-sellers', label: 'Best Sellers', icon: Award },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/size-pricing', label: 'Size Pricing', icon: Tag },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children, title }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)

  useEffect(() => {
    let isMounted = true

    // Fetch unread messages count
    api.get('/contact')
      .then(({ data }) => {
        if (isMounted && Array.isArray(data)) {
          const unread = data.filter((m) => !m.read).length
          setUnreadMessages(unread)
        }
      })
      .catch(() => {})

    // Fetch pending orders count
    api.get('/orders')
      .then(({ data }) => {
        if (isMounted && Array.isArray(data)) {
          const pending = data.filter((o) => o.status === 'payment_pending' || o.status === 'pending').length
          setPendingOrders(pending)
        }
      })
      .catch(() => {})

    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileOpen(false)
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-brand-smoke flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-brand-black text-white px-5 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="WallSticks Logo" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-extrabold text-md">WallSticks</span>
        </div>
        <div className="flex items-center gap-3">
          {unreadMessages > 0 && (
            <span className="text-[10px] font-extrabold bg-brand-yellow text-brand-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <Mail size={12} /> {unreadMessages}
            </span>
          )}
          <button onClick={() => setMobileOpen(true)} className="p-1 rounded-md hover:bg-white/10" aria-label="Open navigation menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-brand-black text-white shrink-0 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-2.5 mb-10">
          <img src="/logo.jpeg" alt="WallSticks Logo" className="w-9 h-9 object-contain rounded-xl" />
          <span className="font-extrabold text-lg">WallSticks</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          {nav.map((n) => {
            const isMessages = n.to === '/admin/messages'
            const isOrders = n.to === '/admin/orders'
            const badgeCount = isMessages ? unreadMessages : isOrders ? pendingOrders : 0

            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-yellow text-brand-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <n.icon size={17} />
                      <span>{n.label}</span>
                    </div>
                    {badgeCount > 0 && (
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full transition-all ${
                          isActive
                            ? 'bg-brand-black text-brand-yellow'
                            : 'bg-brand-yellow text-brand-black'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <button
          onClick={() => { logout(); navigate('/admin/login') }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={17} /> Log Out
        </button>
      </aside>

      {/* Mobile Drawer Navigation Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
              onClick={() => setMobileOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="Admin Navigation Menu"
            >
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute left-0 top-0 bottom-0 w-64 bg-brand-black text-white p-6 flex flex-col z-[100] shadow-2xl overflow-y-auto"
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
                  {nav.map((n) => {
                    const isMessages = n.to === '/admin/messages'
                    const isOrders = n.to === '/admin/orders'
                    const badgeCount = isMessages ? unreadMessages : isOrders ? pendingOrders : 0

                    return (
                      <NavLink
                        key={n.to}
                        to={n.to}
                        end={n.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                            isActive ? 'bg-brand-yellow text-brand-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <n.icon size={17} />
                              <span>{n.label}</span>
                            </div>
                            {badgeCount > 0 && (
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isActive ? 'bg-brand-black text-brand-yellow' : 'bg-brand-yellow text-brand-black'
                                }`}
                              >
                                {badgeCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    )
                  })}
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
        </AnimatePresence>,
        document.body
      )}

      <main className="flex-1 p-3.5 sm:p-6 md:p-10 overflow-x-hidden">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-8">{title}</h1>
        {children}
      </main>
    </div>
  )
}

