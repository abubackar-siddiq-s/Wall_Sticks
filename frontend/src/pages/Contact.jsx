import { useState } from 'react'
import { Phone, Mail, MapPin, Instagram, Clock, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '../hooks/useSettings'
import api from '../lib/api'

export default function Contact() {
  const { settings } = useSettings()
  const [form, setForm] = useState({ name: '', email: '', message: '', company: '' }) // `company` is a honeypot — kept empty by real users, hidden via CSS
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/contact', form)
      toast.success("Message sent — we'll get back within a day")
      setForm({ name: '', email: '', message: '', company: '' })
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("You've sent a few messages already — please try again a bit later")
      } else {
        toast.error('Could not send your message — please try again')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-16">
      <div className="mb-12 text-center">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Get in touch</p>
        <h1 className="text-4xl md:text-5xl font-extrabold">We'd love to hear from you</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-5">
          {[
            { icon: Phone, label: 'Phone', value: settings.phone },
            { icon: MessageCircle, label: 'WhatsApp', value: settings.whatsapp },
            { icon: Mail, label: 'Email', value: settings.email },
            { icon: Instagram, label: 'Instagram', value: settings.instagram },
            { icon: MapPin, label: 'Address', value: settings.address },
            { icon: Clock, label: 'Business Hours', value: settings.businessHours },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-4 bg-brand-smoke rounded-xl2 p-5">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-soft">
                <c.icon size={17} className="text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-black/45 mb-0.5">{c.label}</p>
                <p className="font-semibold text-sm">{c.value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl2 overflow-hidden h-56 bg-brand-smoke">
            <iframe
              title="map"
              className="w-full h-full grayscale"
              src="https://maps.google.com/maps?q=Salem%20Tamil%20Nadu&output=embed"
            />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 h-fit bg-white rounded-xl2 shadow-soft p-8">
          {/* Honeypot: real users never see or fill this (off-screen, no label, not tab-reachable) */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
            aria-hidden="true"
          />
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Your email" className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
          <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your message" rows={5} className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm resize-none" />
          <button disabled={submitting} className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow disabled:opacity-60">
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
