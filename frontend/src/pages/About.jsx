import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'How do I place an order?', a: 'Pick a poster or upload your own image, choose size and finish, and check out. Pay via UPI and we verify and print within hours.' },
  { q: 'What\'s the delivery timeline?', a: 'Orders are printed and dispatched within 24–48 hours, and typically arrive in 3–6 business days depending on your location.' },
  { q: 'What\'s your return policy?', a: 'Since every poster is printed to order, we accept returns only for print defects or shipping damage — reach out within 48 hours of delivery with photos.' },
  { q: 'What paper and printing do you use?', a: 'We print on 250gsm archival matte and gloss paper with pigment-based, fade-resistant inks rated for 75+ years indoors.' },
]

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-black/8 py-5">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="font-semibold">{item.q}</span>
        <ChevronDown size={18} className={`transition-transform shrink-0 ml-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-black/55 text-sm mt-3 leading-relaxed">{item.a}</p>}
    </div>
  )
}

export default function About() {
  return (
    <div>
      <section className="max-w-4xl mx-auto px-5 md:px-8 py-20 text-center">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-3">Our story</p>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">Built for people who take their walls seriously</h1>
        <p className="text-black/55 text-lg max-w-2xl mx-auto">
          WallSticks started with a simple frustration: most poster printers treat every image the same, regardless of quality.
          We built a print process obsessed with color accuracy, paper weight, and finishing — so what you see is what hangs on your wall.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-3 gap-6 mb-24">
        {[
          { title: 'Mission', body: 'Make museum-quality prints accessible to anyone decorating a room, not just galleries.' },
          { title: 'Quality', body: 'Every batch is color-checked before it ships. No exceptions, no shortcuts.' },
          { title: 'Printing Technology', body: 'Giclée pigment printing on archival paper — the same process used for fine art reproductions.' },
        ].map((c) => (
          <div key={c.title} className="bg-brand-smoke rounded-xl2 p-8">
            <h3 className="font-bold text-lg mb-2">{c.title}</h3>
            <p className="text-sm text-black/55 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-5 md:px-8 pb-24">
        <h2 className="text-3xl font-extrabold mb-8">Frequently asked questions</h2>
        {faqs.map((f) => <FaqItem key={f.q} item={f} />)}
      </section>
    </div>
  )
}
