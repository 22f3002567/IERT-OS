import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load env vars (we renamed it to .env earlier)
dotenv.config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('🔴 DATABASE_URL is missing from environment variables.');
}

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });