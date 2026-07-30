import Admin from '../models/Admin.js'
import Category from '../models/Category.js'
import Settings from '../models/Settings.js'

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

export default async function autoSeed() {
  try {
    // 1. System Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@wallsticks.in'
    const seedPassword = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || 'WallSticksAdmin2026!'

    let admin = await Admin.findOne({ email: adminEmail })
    if (!admin) {
      await Admin.create({ email: adminEmail, password: seedPassword, name: 'Palani Kumar' })
      console.log(`✅ System Initialized: Created admin account (${adminEmail})`)
    } else if (process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD) {
      const match = await admin.comparePassword(seedPassword)
      if (!match) {
        admin.password = seedPassword
        await admin.save()
        console.log(`✅ System Admin password updated in database from environment variable`)
      }
    }

    // 2. System Store Categories (ensure standard catalog structure exists)
    for (const cat of categoryList) {
      await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true })
    }

    // 3. System Store Settings
    let settingsDoc = await Settings.findOne()
    if (!settingsDoc) {
      await Settings.create({
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
      console.log('✅ System Initialized: Configured store settings')
    }
  } catch (err) {
    console.error('AutoSeed System Setup error:', err.message)
  }
}
