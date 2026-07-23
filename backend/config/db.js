import mongoose from 'mongoose'

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`)
    console.warn('Keep-alive: Express server will remain online and Mongoose will retry connecting.')
  }
}
