import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'

process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({
    level: 'error',
    message: 'Unhandled Promise Rejection',
    reason: reason?.message || String(reason),
    timestamp: new Date().toISOString(),
  }))
})

process.on('uncaughtException', (err) => {
  console.error(JSON.stringify({
    level: 'fatal',
    message: 'Uncaught Exception',
    error: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  }))
  setTimeout(() => process.exit(1), 1000)
})

const PORT = process.env.PORT || 5000
let server

async function start() {
  try {
    await connectDB()
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(JSON.stringify({
        level: 'info',
        message: `Server running on port ${PORT}`,
        env: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      }))
    })

    const shutdown = async (signal) => {
      console.log(JSON.stringify({
        level: 'info',
        message: `${signal} received — shutting down gracefully`,
        timestamp: new Date().toISOString(),
      }))
      
      server.close(async () => {
        try {
          const { default: mongoose } = await import('mongoose')
          await mongoose.connection.close()
        } catch { /* ignore */ }
        process.exit(0)
      })

      setTimeout(() => {
        console.error('Forced shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'))
    process.on('SIGINT', () => shutdown('SIGINT'))
  } catch (err) {
    console.error(JSON.stringify({
      level: 'fatal',
      message: 'Failed to start server',
      error: err.message,
      timestamp: new Date().toISOString(),
    }))
    process.exit(1)
  }
}

start()
