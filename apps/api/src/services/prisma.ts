import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'
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
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
    await pool.end()
  })
}

export { prisma }
