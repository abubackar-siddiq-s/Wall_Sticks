import mongoose from 'mongoose'

/**
 * Fallback SRV resolver via DNS-over-HTTPS (DoH) for environments
 * where Node.js SRV UDP queries encounter ECONNREFUSED / ETIMEOUT (e.g. Windows dev environments).
 */
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
    console.warn('DoH SRV resolution warning:', e.message)
  }
  return srvUri
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error('CRITICAL: MONGO_URI is missing in process.env!')
    throw new Error('MONGO_URI is missing')
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
    })
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err) {
    if (uri.startsWith('mongodb+srv://') && (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEOUT'))) {
      console.warn('Standard SRV DNS lookup failed. Resolving Atlas seedlist via DoH...')
      try {
        const fallbackUri = await resolveSrvDoH(uri)
        if (fallbackUri && fallbackUri !== uri) {
          const conn = await mongoose.connect(fallbackUri, {
            maxPoolSize: 50,
            minPoolSize: 5,
            socketTimeoutMS: 45000,
            serverSelectionTimeoutMS: 10000,
          })
          console.log(`MongoDB Connected via fallback seedlist: ${conn.connection.host}`)
          return
        }
      } catch (fallbackErr) {
        console.error(`DoH Fallback Connection Error: ${fallbackErr.message}`)
      }
    }
    console.error(`MongoDB Connection Error: ${err.message}`)
    throw err
  }
}

export default connectDB
