import { Phone, Mail, MapPin, Instagram, MessageCircle } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function Contact() {
  const { settings } = useSettings()

  const contactList = [
    { icon: Phone, label: 'Phone', value: settings.phone || '+91 88705 58436', href: `tel:${(settings.phone || '+91 88705 58436').replace(/\s+/g, '')}` },
    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp || '+91 88705 58436', href: `https://wa.me/${(settings.whatsapp || '+91 88705 58436').replace(/\D/g, '')}` },
    { icon: Mail, label: 'Email', value: settings.email || 'wallsticks0319@gmail.com', href: `mailto:${settings.email || 'wallsticks0319@gmail.com'}` },
    { icon: Instagram, label: 'Instagram', value: settings.instagram || '@wallsticks', href: `https://instagram.com/${(settings.instagram || 'wallsticks').replace('@', '')}` },
    { icon: MapPin, label: 'Location', value: 'Perundurai, Erode, Tamil Nadu', href: 'https://maps.google.com/?q=Perundurai+Erode+Tamil+Nadu' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-16">
      <div className="mb-12 text-center">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">We'd love to hear from you</h1>
        <p className="text-black/55 text-sm max-w-md mx-auto">
          Have a question about our posters or custom orders? Reach out to us directly through any channel below.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {contactList.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-brand-smoke hover:bg-brand-yellow/15 border border-black/5 rounded-2xl p-5 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-soft group-hover:scale-105 transition-transform">
              <c.icon size={20} className="text-brand-gold" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-black/45 uppercase tracking-wider mb-0.5">{c.label}</p>
              <p className="font-extrabold text-sm text-brand-black truncate">{c.value}</p>
            </div>
          </a>
        ))}
      </div>

      {/* MAP LOCATION */}
      <div className="rounded-3xl overflow-hidden h-72 bg-brand-smoke shadow-card border border-black/5">
        <iframe
          title="WallSticks Location Map"
          className="w-full h-full border-0"
          loading="lazy"
          src="https://maps.google.com/maps?q=Perundurai%20Erode%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed"
        />
      </div>
    </div>
  )
}
