import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

// Step 1: Create a pg connection pool with the database URL
const isProduction = env.nodeEnv === 'production';
const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isProduction || env.databaseUrl.includes('render.com') ? { rejectUnauthorized: false } : undefined,
});

// Step 2: Wrap the pool with the Prisma adapter
const adapter = new PrismaPg(pool);

// Step 3: Create the Prisma client using the adapter
const prisma = new PrismaClient({ adapter });

export default prisma;
