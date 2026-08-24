import mongoose from 'mongoose'

async function resolveSrvDoH(srvUri) {
  try {
    const match = srvUri.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/\?]+)(\/.*)?$/)
    if (!match) return srvUri
    const [, user, pass, host, rest = ''] = match
    const res = await fetch(`https://dns.google/resolve?name=_mongodb._tcp.${host}&type=SRV`)
    const data = await res.json()
    if (data.Answer && data.Answer.length > 0) {
      const seeds = data.Answer.map((a) => {
        const parts = a.data.trim().split(/\s+/)
        const port = parts[2] || '27017'
        const domain = parts[3] ? parts[3].replace(/\.$/, '') : host
        return `${domain}:${port}`
      }).join(',')
      const joiner = rest.includes('?') ? '&' : '/?'
      return `mongodb://${user}:${pass}@${seeds}${rest}${joiner}ssl=true&authSource=admin`
    }
  } catch (e) {
    console.warn('DNS-over-HTTPS resolution error:', e.message)
  }
  return srvUri
}

export default async function connectDB() {
  let uri = process.env.MONGO_URI
  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
      console.warn('SRV DNS lookup failed on Windows Node.js. Resolving MongoDB Atlas seedlist via DoH...')
      const fallbackUri = await resolveSrvDoH(uri)
      if (fallbackUri !== uri) {
        const conn = await mongoose.connect(fallbackUri, {
          maxPoolSize: 50,
          minPoolSize: 5,
          socketTimeoutMS: 45000,
          serverSelectionTimeoutMS: 5000,
        })
        console.log(`MongoDB connected via fallback seedlist: ${conn.connection.host}`)
        return
      }
    }
    console.error(`MongoDB connection error: ${err.message}`)
    console.warn('Keep-alive: Express server will remain online and Mongoose will retry connecting.')
    throw err
  }
}
