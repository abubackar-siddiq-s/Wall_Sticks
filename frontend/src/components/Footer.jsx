import { Link } from 'react-router-dom'
import { Instagram, Mail, Phone, MapPin } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function Footer() {
  const { settings } = useSettings()
  return (
    <footer className="bg-brand-black text-white mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl2 bg-brand-yellow flex items-center justify-center">
              <span className="text-brand-black font-extrabold text-lg leading-none">P</span>
            </span>
            <span className="font-extrabold text-xl">PosterWall</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">Museum-grade prints for walls that mean something. Designed, printed, and packed with care.</p>
          <div className="flex gap-3 mt-5">
            <a href={`https://instagram.com/${(settings.instagram || '').replace('@','')}`} className="p-2 rounded-full bg-white/10 hover:bg-brand-yellow hover:text-black transition-colors" aria-label="Instagram"><Instagram size={16} /></a>
            <a href={`mailto:${settings.email || ''}`} className="p-2 rounded-full bg-white/10 hover:bg-brand-yellow hover:text-black transition-colors" aria-label="Email"><Mail size={16} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-brand-yellow mb-4 text-sm tracking-wide">Shop</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link to="/shop" className="hover:text-white transition-colors">All Posters</Link></li>
            <li><Link to="/create-your-own" className="hover:text-white transition-colors">Create Your Own</Link></li>
            <li><Link to="/shop?sort=popular" className="hover:text-white transition-colors">Best Sellers</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-brand-yellow mb-4 text-sm tracking-wide">Company</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Order</Link></li>
            <li><Link to="/about#faq" className="hover:text-white transition-colors">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-brand-yellow mb-4 text-sm tracking-wide">Get in touch</h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li className="flex items-center gap-2"><Phone size={14} /> {settings.phone}</li>
            <li className="flex items-center gap-2"><Mail size={14} /> {settings.email}</li>
            <li className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0" /> {settings.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-white/40 text-xs">
        © {new Date().getFullYear()} PosterWall. All rights reserved.
      </div>
    </footer>
  )
}
