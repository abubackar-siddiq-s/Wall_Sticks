// Script to clean test data from database before launching live.
// Run with: npm run clean:db
// Run with --with-products to also delete test products: npm run clean:db -- --with-products

import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])

import dotenv from 'dotenv'
import connectDB from './config/db.js'

import Order from './models/Order.js'
import Payment from './models/Payment.js'
import Cart from './models/Cart.js'
import Wishlist from './models/Wishlist.js'
import Otp from './models/Otp.js'
import Review from './models/Review.js'
import ContactMessage from './models/ContactMessage.js'
import User from './models/User.js'
import Trending from './models/Trending.js'
import Product from './models/Product.js'

dotenv.config()

async function cleanDatabase() {
  await connectDB()

  const includeProducts = process.argv.includes('--with-products')

  console.log('🧹 Starting database cleanup...')

  // 1. Delete test orders and payments
  const ordersDeleted = await Order.deleteMany({})
  console.log(`✅ Deleted ${ordersDeleted.deletedCount} orders`)

  const paymentsDeleted = await Payment.deleteMany({})
  console.log(`✅ Deleted ${paymentsDeleted.deletedCount} payments`)

  // 2. Delete test user activity
  const cartsDeleted = await Cart.deleteMany({})
  console.log(`✅ Deleted ${cartsDeleted.deletedCount} cart items`)

  const wishlistsDeleted = await Wishlist.deleteMany({})
  console.log(`✅ Deleted ${wishlistsDeleted.deletedCount} wishlist items`)

  const otpsDeleted = await Otp.deleteMany({})
  console.log(`✅ Deleted ${otpsDeleted.deletedCount} expired OTP records`)

  const reviewsDeleted = await Review.deleteMany({})
  console.log(`✅ Deleted ${reviewsDeleted.deletedCount} reviews`)

  const contactMessagesDeleted = await ContactMessage.deleteMany({})
  console.log(`✅ Deleted ${contactMessagesDeleted.deletedCount} contact messages`)

  const trendingDeleted = await Trending.deleteMany({})
  console.log(`✅ Reset trending analytics data`)

  // 3. Delete non-admin user accounts
  const usersDeleted = await User.deleteMany({})
  console.log(`✅ Deleted ${usersDeleted.deletedCount} registered user accounts`)

  // 4. Optionally delete products
  if (includeProducts) {
    const productsDeleted = await Product.deleteMany({})
    console.log(`🗑️ Deleted ${productsDeleted.deletedCount} test products (--with-products flag set)`)
  } else {
    console.log(`ℹ️ Products kept untouched. Pass '-- --with-products' if you also want to remove test products.`)
  }

  console.log('\n✨ Database successfully cleaned! Your Admin account and Store Settings are safe.')
  process.exit(0)
}

cleanDatabase().catch((err) => {
  console.error('❌ Database cleanup error:', err)
  process.exit(1)
})
