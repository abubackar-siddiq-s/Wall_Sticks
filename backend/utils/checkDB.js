// Database State Verification Script
import dns from 'node:dns'
dns.setServers(['1.1.1.1', '8.8.8.8'])

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import connectDB from '../config/db.js'

import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Settings from '../models/Settings.js'
import Admin from '../models/Admin.js'

dotenv.config()

async function check() {
  try {
    await connectDB()
    console.log('⚡ Connected to database...')

    const adminCount = await Admin.countDocuments()
    const admins = await Admin.find({}, 'email name')
    console.log(`- Admins: ${adminCount}`, admins)

    const categoryCount = await Category.countDocuments()
    const categories = await Category.find({}, 'name slug emoji order')
    console.log(`- Categories: ${categoryCount}`, categories)

    const settingsCount = await Settings.countDocuments()
    const settings = await Settings.findOne()
    console.log(`- Settings: ${settingsCount}`, settings)

    const productCount = await Product.countDocuments()
    console.log(`- Products: ${productCount}`)

    process.exit(0)
  } catch (err) {
    console.error('❌ Check failed:', err)
    process.exit(1)
  }
}

check()
