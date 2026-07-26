// Database Cleanup Script
// Removes all dummy/demo records (products, orders, reviews, payments, contact messages, carts, wishlists, trending)
// to ensure a clean start for production. Settings and standard categories will be automatically re-seeded by autoSeed.

import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from '../config/db.js'

import Product from '../models/Product.js'
import Review from '../models/Review.js'
import Order from '../models/Order.js'
import Payment from '../models/Payment.js'
import ContactMessage from '../models/ContactMessage.js'
import Cart from '../models/Cart.js'
import Wishlist from '../models/Wishlist.js'
import Trending from '../models/Trending.js'
import Category from '../models/Category.js'
import Settings from '../models/Settings.js'

dotenv.config()

async function cleanup() {
  try {
    await connectDB()
    console.log('⚡ Connected to database for cleanup...')

    console.log('🧹 Purging dummy collections...')

    const resProducts = await Product.deleteMany({})
    console.log(`- Deleted ${resProducts.deletedCount} products`)

    const resReviews = await Review.deleteMany({})
    console.log(`- Deleted ${resReviews.deletedCount} reviews`)

    const resOrders = await Order.deleteMany({})
    console.log(`- Deleted ${resOrders.deletedCount} orders`)

    const resPayments = await Payment.deleteMany({})
    console.log(`- Deleted ${resPayments.deletedCount} payments`)

    const resMessages = await ContactMessage.deleteMany({})
    console.log(`- Deleted ${resMessages.deletedCount} contact messages`)

    const resCarts = await Cart.deleteMany({})
    console.log(`- Deleted ${resCarts.deletedCount} carts`)

    const resWishlists = await Wishlist.deleteMany({})
    console.log(`- Deleted ${resWishlists.deletedCount} wishlists`)

    const resTrending = await Trending.deleteMany({})
    console.log(`- Deleted ${resTrending.deletedCount} trending links`)

    const resCategories = await Category.deleteMany({})
    console.log(`- Deleted ${resCategories.deletedCount} categories`)

    const resSettings = await Settings.deleteMany({})
    console.log(`- Deleted ${resSettings.deletedCount} settings`)

    console.log('🎉 Cleanup completed successfully!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Cleanup failed:', err)
    process.exit(1)
  }
}

cleanup()
