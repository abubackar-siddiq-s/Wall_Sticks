import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) return toast.error('Enter a valid email')
    toast.success("You're on the list!")
    setEmail('')
  }
  return (
    <section className="max-w-7xl mx-auto px-5 md:px-8 my-24">
      <div className="bg-brand-black rounded-xl3 px-8 py-14 md:py-16 text-center relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand-yellow/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-brand-yellow/10 rounded-full blur-3xl" />
        <h3 className="text-white text-2xl md:text-4xl font-extrabold mb-3 relative">Get 10% off your first order</h3>
        <p className="text-white/50 mb-8 relative">New drops, restocks, and design tips — no spam, unsubscribe anytime.</p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 px-5 py-3.5 rounded-full bg-white/10 text-white placeholder-white/40 border border-white/15 focus:border-brand-yellow outline-none"
          />
          <button className="bg-brand-yellow text-brand-black font-bold px-7 py-3.5 rounded-full hover:brightness-95 transition">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
