// Mock data — replace with live API calls once the backend is connected (see src/lib/api.js).
// Every field here mirrors the Mongoose schema shape in /backend/models so swapping to real data is a 1:1 drop-in.

export const categories = [
  { slug: 'motivational', name: 'Motivational', emoji: '🔥' },
  { slug: 'minimal', name: 'Minimal', emoji: '◻️' },
  { slug: 'nature', name: 'Nature', emoji: '🌿' },
  { slug: 'movies', name: 'Movies', emoji: '🎬' },
  { slug: 'sports', name: 'Sports', emoji: '🏀' },
  { slug: 'anime', name: 'Anime', emoji: '⛩️' },
  { slug: 'gaming', name: 'Gaming', emoji: '🎮' },
  { slug: 'typography', name: 'Typography', emoji: '🔤' },
  { slug: 'abstract', name: 'Abstract', emoji: '🎨' },
  { slug: 'modern', name: 'Modern', emoji: '🏙️' },
]

const img = (seed) => `https://picsum.photos/seed/${seed}/800/1100`

export const products = Array.from({ length: 24 }).map((_, i) => {
  const cat = categories[i % categories.length]
  return {
    _id: `p${i + 1}`,
    name: [
      'Midnight Skyline', 'Quiet Mountains', 'Neon Drift', 'Golden Hour',
      'Discipline Equals Freedom', 'Retro Sunset', 'Wabi-Sabi', 'Cosmic Bloom',
      'Concrete Jungle', 'Slow Mornings', 'Static Motion', 'Fade to Black'
    ][i % 12] + ` ${cat.name}`,
    category: cat.slug,
    price: 399 + (i % 6) * 150,
    mrp: 599 + (i % 6) * 150,
    rating: (3.8 + (i % 5) * 0.25).toFixed(1),
    reviewsCount: 12 + i * 3,
    images: [img(`poster${i}a`), img(`poster${i}b`), img(`poster${i}c`)],
    featured: i % 5 === 0,
    bestSeller: i % 4 === 0,
    trending: i % 3 === 0,
    description: 'Museum-grade giclée print on premium 250gsm archival paper. Fade-resistant inks, hand-inspected before it ships, and finished to hang the day it arrives.',
    sizes: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'],
    finishes: ['Premium Matte', 'Gloss', 'Canvas', 'Framed'],
    borders: ['White', 'Black', 'No Border'],
  }
})

export const reviews = [
  { id: 1, name: 'Ananya R.', rating: 5, text: 'Print quality is unreal for the price — colors are richer than the preview.', product: 'Midnight Skyline' },
  { id: 2, name: 'Karthik M.', rating: 5, text: 'Framed option arrived perfectly packed, zero corner dents. Ordering again.', product: 'Discipline Equals Freedom' },
  { id: 3, name: 'Priya S.', rating: 4, text: 'Custom upload flow was so easy, had my dog\'s photo on the wall in days.', product: 'Custom Poster' },
]

export const settings = {
  businessName: 'PosterWall',
  ownerName: 'Abu',
  phone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  email: 'hello@posterwall.in',
  instagram: '@posterwall.in',
  address: '14, Cambridge Layout, Salem, Tamil Nadu, India',
  businessHours: 'Mon–Sat, 10:00 AM – 7:00 PM',
  upiId: 'posterwall@okhdfcbank',
  courierCharge: 79,
  gstPercent: 0,
  pickupAddress: '14, Cambridge Layout, Salem, Tamil Nadu',
  pickupTime: 'Mon–Sat, 11 AM – 6 PM',
}
