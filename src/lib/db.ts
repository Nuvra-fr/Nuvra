import { mkdirSync } from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as { sqlite?: Database.Database; db?: DB };

export function databaseFile(): string {
  return process.env.DATABASE_URL ?? './nuvra.db';
}

function createDb(): DB {
  const file = databaseFile();
  // SQLite creates the file but not its directory — on a fresh persistent
  // volume (e.g. DATABASE_URL=/data/nuvra.db) the folder may not exist yet.
  if (file !== ':memory:' && !file.startsWith('file:')) {
    mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
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
