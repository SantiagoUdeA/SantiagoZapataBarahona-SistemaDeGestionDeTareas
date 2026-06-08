// Prisma client singleton with PG driver adapter
// Shared instance across server runtime to reuse connection pool and avoid creating new clients

import { PrismaClient } from '../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Extend global namespace to store Prisma instance
// Prevents multiple PrismaClient instances in development (which would create multiple pools)
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Initialize PG driver adapter with connection string from environment
// The adapter bridges Prisma Client with the native PostgreSQL driver
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Create or reuse existing PrismaClient
// In development (NODE_ENV !== 'production'), reuse the stored instance to avoid connection pool exhaustion
// In production, create a fresh instance for each deployment
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

// Store instance in development to enable hot reloading without reconnection
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
