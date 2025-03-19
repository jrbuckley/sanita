import { PrismaClient } from '@prisma/client'
import { Pool, PoolClient } from 'pg'

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// Initialize connection pool for raw queries
const pool = new Pool({
  user: process.env.DB_USER || 'sanita_user',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sanita',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Graceful shutdown
const shutdown = async () => {
  try {
    await prisma.$disconnect()
    await pool.end()
    console.log('Database connections closed.')
  } catch (error) {
    console.error('Error during database shutdown:', error)
    process.exit(1)
  }
}

// Handle process termination
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

// Export database instances
export { prisma, pool }

// Type-safe transaction helper
export const transaction = async <T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  try {
    return await prisma.$transaction(callback)
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

// Query helper with automatic retries
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error | undefined
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (!isRetryableError(error)) throw error
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError
}

// Helper to determine if an error is retryable
const isRetryableError = (error: any): boolean => {
  const retryableCodes = [
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '55P03', // lock_not_available
  ]
  
  return retryableCodes.includes(error?.code) ||
    error?.message?.includes('Connection terminated unexpectedly')
}

// Middleware for request transaction context
export const withTransaction = (handler: (tx: PrismaClient) => Promise<void>) => {
  return async (...args: any[]) => {
    return transaction(async (tx) => {
      return handler(tx)
    })
  }
} 