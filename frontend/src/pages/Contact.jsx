import { useState } from 'react'
import { Phone, Mail, MapPin, Instagram, MessageCircle, Send, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '../hooks/useSettings'
import api from '../lib/api'

export default function Contact() {
  const { settings } = useSettings()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const contactList = [
    { icon: Phone, label: 'Phone', value: settings.phone || '+91 88705 58436', href: `tel:${(settings.phone || '+91 88705 58436').replace(/\s+/g, '')}` },
    { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp || '+91 88705 58436', href: `https://wa.me/${(settings.whatsapp || '+91 88705 58436').replace(/\D/g, '')}` },
    { icon: Mail, label: 'Email', value: settings.email || 'wallsticks0319@gmail.com', href: `mailto:${settings.email || 'wallsticks0319@gmail.com'}` },
    { icon: Instagram, label: 'Instagram', value: settings.instagram || '@wall_sticks_official', href: `https://www.instagram.com/${(settings.instagram || 'wall_sticks_official').replace('@', '')}` },
    { icon: MapPin, label: 'Location', value: settings.address || 'Perundurai, Erode, Tamil Nadu', href: 'https://maps.google.com/?q=Perundurai+Erode+Tamil+Nadu' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      return toast.error('Please fill in all fields')
    }

    setSubmitting(true)
    try {
      await api.post('/contact', formData)
      setSent(true)
      setFormData({ name: '', email: '', message: '' })
      toast.success('Message sent! We will get back to you shortly.')
    } catch (err) {
      const serverError = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || 'Could not send message. Please try again.'
      toast.error(serverError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-14">
      <div className="mb-12 text-center">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">We'd love to hear from you</h1>
        <p className="text-black/55 text-sm max-w-md mx-auto">
          Have a question about our posters, custom prints, or bulk orders? Send us a message or reach out via any channel below.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* CONTACT DIRECT INFO */}
        <div className="space-y-4">
          <h2 className="font-extrabold text-xl text-brand-black mb-4">Direct Contact Channels</h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {contactList.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 bg-brand-smoke hover:bg-brand-yellow/15 border border-black/5 rounded-2xl p-4 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-soft group-hover:scale-105 transition-transform">
                  <c.icon size={18} className="text-brand-gold" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-black/45 uppercase tracking-wider">{c.label}</p>
                  <p className="font-extrabold text-xs text-brand-black truncate">{c.value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* MAP LOCATION */}
          <div className="rounded-3xl overflow-hidden h-56 bg-brand-smoke shadow-soft border border-black/5 mt-6">
            <iframe
              title="WallSticks Location Map"
              className="w-full h-full border-0"
              loading="lazy"
              src="https://maps.google.com/maps?q=Perundurai%20Erode%20Tamil%20Nadu&t=&z=13&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>

        {/* SEND MESSAGE FORM */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-card border border-black/5">
          <h2 className="font-extrabold text-xl text-brand-black mb-2">Send Us a Message</h2>
          <p className="text-xs text-black/50 mb-6">
            Fill out the form below. Your message will be sent straight to our admin team.
          </p>

          {sent ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-extrabold text-lg text-brand-black">Thank You!</h3>
              <p className="text-xs text-black/60 max-w-xs mx-auto">
                Your message has been received. Our team will review it in the Admin Messages inbox and respond to your email soon.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-xs font-bold text-brand-black underline hover:text-brand-gold transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/70 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message, inquiry, or custom order request..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-sm font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-black text-brand-yellow font-extrabold py-3.5 rounded-xl text-xs hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send size={15} /> {submitting ? 'Sending...' : 'Send Message to Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
