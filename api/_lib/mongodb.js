import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) throw new Error('MONGODB_URI not set in environment variables')

/**
 * Persistent connection strategy for long-running servers (Render).
 * Auto-reconnects on disconnect with exponential backoff.
 */
let isConnected = false
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

mongoose.connection.on('connected', () => {
  isConnected = true
  reconnectAttempts = 0
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
    reconnectAttempts++
    console.error(JSON.stringify({
      level: 'warn',
      message: `MongoDB disconnected — reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
      timestamp: new Date().toISOString(),
    }))
    setTimeout(() => connectDB(), delay)
  } else {
    console.error(JSON.stringify({
      level: 'error',
      message: 'MongoDB reconnection attempts exhausted — manual intervention required',
      timestamp: new Date().toISOString(),
    }))
  }
})

mongoose.connection.on('error', (err) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'MongoDB connection error',
    error: err.message,
    timestamp: new Date().toISOString(),
  }))
})

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return

  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize:              10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:          45000,
      family:                   4,
    })
  } catch (err) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'MongoDB initial connection failed',
      error: err.message,
      timestamp: new Date().toISOString(),
    }))
    // Retry with exponential backoff
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
      reconnectAttempts++
      setTimeout(() => connectDB(), delay)
    }
  }
}

export { connectDB }
export default connectDB
