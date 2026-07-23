import { Link } from 'react-router-dom'
import { Frame } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-5 py-32 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-smoke flex items-center justify-center mx-auto mb-6">
        <Frame size={28} className="text-black/30" />
      </div>
      <h1 className="text-4xl font-extrabold mb-3">404</h1>
      <p className="text-black/50 mb-8">This page doesn't exist — maybe the poster you're after moved, or the link's a little off.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="bg-brand-black text-brand-yellow font-bold px-7 py-3.5 rounded-full">Back to Home</Link>
        <Link to="/shop" className="font-bold px-7 py-3.5 rounded-full border-2 border-black/10 hover:border-brand-black transition-colors">Browse Posters</Link>
      </div>
    </div>
  )
}
