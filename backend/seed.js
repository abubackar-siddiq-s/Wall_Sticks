// Seeds a starter admin account, categories, and settings document.
// Run with: npm run seed  (after setting MONGO_URI and ADMIN credentials in .env)
import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])

import dotenv from 'dotenv'
import connectDB from './config/db.js'
import Admin from './models/Admin.js'
import Category from './models/Category.js'
import Settings from './models/Settings.js'

dotenv.config()

const categories = [
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

async function seed() {
  await connectDB()

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@posterwall.in'
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || process.env.ADMIN_PASSWORD_HASH || 'ChangeMe123!'
  
  const existingAdmin = await Admin.findOne({ email: adminEmail })
  if (!existingAdmin) {
    await Admin.create({ email: adminEmail, password: seedPassword, name: 'PosterWall Admin' })
    console.log(`Admin created: ${adminEmail}`)
  } else {
    existingAdmin.password = seedPassword
    await existingAdmin.save()
    console.log(`Admin updated: ${adminEmail} (password updated to the value in .env)`)
  }

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true })
  }
  console.log(`Seeded ${categories.length} categories`)

  const existingSettings = await Settings.findOne()
  if (!existingSettings) {
    await Settings.create({
      businessName: 'PosterWall',
      courierCharge: 79,
      gstPercent: 0,
    })
    console.log('Default settings created')
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
