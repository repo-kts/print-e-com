import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { Pool } from 'pg'

// For serverless environments (like Vercel), use connection pooling
// This prevents connection exhaustion in serverless functions
const connectionString = `${process.env.DATABASE_URL}`

// Create a connection pool for serverless environments
// In serverless, each function invocation should reuse connections
const pool = new Pool({
  connectionString,
  // Connection pool settings optimized for serverless
  max: 1, // Limit connections per function instance
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

const adapter = new PrismaPg(pool)

// Configure Prisma Client for serverless
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Graceful shutdown for serverless environments
let isShuttingDown = false
let cleanupRegistered = false

if (typeof process !== 'undefined') {
  const cleanup = async () => {
    if (isShuttingDown) return
    isShuttingDown = true
    
    try {
      // Disconnect Prisma client
      if (prisma) {
        await prisma.$disconnect().catch(() => {
          // Ignore disconnect errors
        })
      }
      
      // End pool only if it's not already ending/ended
      if (pool && !pool.ending) {
        await pool.end().catch(() => {
          // Ignore pool end errors (might already be closed)
        })
      }
    } catch (error) {
      // Silently ignore cleanup errors
    }
  }
  
  // Only register cleanup handlers once
  if (!cleanupRegistered) {
    cleanupRegistered = true
    
    // Use 'exit' instead of 'beforeExit' to avoid multiple calls
    process.once('SIGINT', cleanup)
    process.once('SIGTERM', cleanup)
    
    // Handle uncaught exceptions and unhandled rejections
    process.once('uncaughtException', (err) => {
      console.error('Uncaught exception:', err)
      cleanup()
      process.exit(1)
    })
    
    process.once('unhandledRejection', (reason) => {
      console.error('Unhandled rejection:', reason)
      cleanup()
      process.exit(1)
    })
  }
}

export { prisma }
