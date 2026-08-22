// Seeds starter admin account, categories, store settings, products, and reviews into MongoDB.
// Run with: npm run seed
import dns from 'node:dns'
try { dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8']) } catch { }

import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Admin from './models/Admin.js'
import Category from './models/Category.js'
import Product from './models/Product.js'
import Settings from './models/Settings.js'
import Review from './models/Review.js'

dotenv.config()

const categoryList = [
  { name: 'Motivational', slug: 'motivational', emoji: '🔥', order: 1 },
  { name: 'Minimal', slug: 'minimal', emoji: '◻️', order: 2 },
  { name: 'Nature', slug: 'nature', emoji: '🌿', order: 3 },
  { name: 'Movies', slug: 'movies', emoji: '🎬', order: 4 },
  { name: 'Sports', slug: 'sports', emoji: '🏀', order: 5 },
  { name: 'Anime', slug: 'anime', emoji: '⛩️', order: 6 },
  { name: 'Gaming', slug: 'gaming', emoji: '🎮', order: 7 },
  { name: 'Typography', slug: 'typography', emoji: '🔤', order: 8 },
  { name: 'Abstract', slug: 'abstract', emoji: '🎨', order: 9 },
  { name: 'Modern', slug: 'modern', emoji: '🏙️', order: 10 },
]

const posterNames = [
  'Midnight Skyline', 'Quiet Mountains', 'Neon Drift', 'Golden Hour',
  'Discipline Equals Freedom', 'Retro Sunset', 'Wabi-Sabi', 'Cosmic Bloom',
  'Concrete Jungle', 'Slow Mornings', 'Static Motion', 'Fade to Black'
]

const imgUrl = (seed) => `https://picsum.photos/seed/${seed}/800/1100`

async function seed() {
  await connectDB()

  console.log('🌱 Starting database seeding...')

  // 1. Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallsticks.in'
  const seedPassword = process.env.ADMIN_PASSWORD || 'WallSticksAdmin2026!'

  let admin = await Admin.findOne({ email: adminEmail })
  if (!admin) {
    await Admin.create({ email: adminEmail, password: seedPassword, name: 'Palani Kumar' })
    console.log(`✅ Created default admin: ${adminEmail}`)
  }

  // 2. Categories
  const categoryDocMap = {}
  for (const cat of categoryList) {
    const doc = await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true })
    categoryDocMap[cat.slug] = doc._id
  }
  console.log(`✅ Seeded ${categoryList.length} categories`)

  // 3. Settings
  let settingsDoc = await Settings.findOne()
  if (!settingsDoc) {
    settingsDoc = await Settings.create({
      businessName: 'WallSticks',
      ownerName: 'Palani Kumar',
      phone: '+91 88705 58436',
      whatsapp: '+91 88705 58436',
      email: 'wallsticks0319@gmail.com',
      instagram: '@wallsticks',
      address: 'Perundurai, Erode, Tamil Nadu',
      pickupAddress: 'Perundurai, Erode, Tamil Nadu',
      courierCharge: 79,
      gstPercent: 0,
    })
    console.log('✅ Created default store settings')
  } else {
    settingsDoc.ownerName = 'Palani Kumar'
    settingsDoc.phone = '+91 88705 58436'
    settingsDoc.whatsapp = '+91 88705 58436'
    settingsDoc.email = 'wallsticks0319@gmail.com'
    settingsDoc.instagram = '@wallsticks'
    settingsDoc.address = 'Perundurai, Erode, Tamil Nadu'
    await settingsDoc.save()
  }

  // 4. Products
  const count = await Product.countDocuments()
  if (count === 0) {
    const productsToCreate = Array.from({ length: 24 }).map((_, i) => {
      const cat = categoryList[i % categoryList.length]
      const name = `${posterNames[i % posterNames.length]} ${cat.name}`
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${i + 1}`

      return {
        name,
        slug,
        category: categoryDocMap[cat.slug],
        price: 399 + (i % 6) * 100,
        mrp: 599 + (i % 6) * 100,
        rating: 0,
        reviewsCount: 0,
        images: [{ url: imgUrl(`ws_poster_${i + 1}`) }],
        sizes: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'],
        featured: i % 5 === 0,
        bestSeller: i % 4 === 0,
        trending: i % 3 === 0,
        active: true,
      }
    })

    const createdProducts = await Product.insertMany(productsToCreate)
    console.log(`✅ Seeded ${createdProducts.length} poster products`)
  }

  console.log('🎉 Database seeding complete successfully!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seeding error:', err)
  process.exit(1)
})
