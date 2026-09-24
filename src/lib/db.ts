import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { sqlite?: Database.Database; db?: DB };

function createDb(): DB {
  const file = process.env.DATABASE_URL ?? './nuvra.db';
  const sqlite = new Database(file);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  return drizzle(sqlite, { schema });
}

export const db: DB = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export { schema };
