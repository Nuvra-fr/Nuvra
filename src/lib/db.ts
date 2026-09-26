import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { createClient, type Client } from '@libsql/client';
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '@/db/schema';

export type DB = LibSQLDatabase<typeof schema> & { $client: Client };

/**
 * Where the database actually lives.
 *
 * libSQL (the engine behind Turso) speaks both to a local file and to a
 * hosted database, so a single driver can serve local development, Docker
 * and a serverless deployment (Vercel has no persistent disk).
 */
export interface DatabaseTarget {
  /** Connection string handed to the libSQL client: `file:…`, `libsql://…`, `:memory:`. */
  url: string;
  authToken?: string;
  /** true when the database is a file on this machine (no hosted database). */
  local: boolean;
  /** Which environment variable the target came from — for logs only. */
  source: string;
}

/** Remote libSQL/Turso connection strings (https/wss are the WebSocket variants). */
const REMOTE_URL = /^(libsql|https|wss):\/\//i;

function isRemoteUrl(value: string): boolean {
  return REMOTE_URL.test(value);
}

/** A Turso hostname that did not bother with a `libsql://` scheme. */
function isTursoHost(value: string): boolean {
  return /\.turso\.io(\/|$)/i.test(value);
}

function read(key: string): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

/** Auth token paired with a `*_DATABASE_URL` variable. */
function tokenFor(key: string): string | undefined {
  const paired = read(key.replace(/DATABASE_URL$/i, 'AUTH_TOKEN'));
  if (paired) return paired;
  if (key === 'DATABASE_URL' || key === 'TURSO_DATABASE_URL') {
    return read('TURSO_AUTH_TOKEN') ?? read('DATABASE_AUTH_TOKEN');
  }
  return undefined;
}

/** Local database file (only meaningful when no hosted database is configured). */
export function databaseFile(): string {
  const raw = read('DATABASE_URL');
  if (raw && !isRemoteUrl(raw) && !isTursoHost(raw)) return raw;
  return './nuvra.db';
}

/**
 * Resolution order:
 *   1. TURSO_DATABASE_URL / DATABASE_URL when they carry a connection string
 *      (`libsql://`, `https://`, `wss://`) — the documented Turso setup.
 *   2. any other `*_DATABASE_URL` variable pointing at libSQL or *.turso.io:
 *      the Vercel Marketplace Turso integration prefixes the variables with
 *      the name of the store (e.g. STORAGE_TURSO_DATABASE_URL +
 *      STORAGE_TURSO_AUTH_TOKEN). A hosted database always wins over a path.
 *   3. a local file (default `./nuvra.db`) — development, tests, Docker.
 */
export function databaseTarget(): DatabaseTarget {
  for (const key of ['TURSO_DATABASE_URL', 'DATABASE_URL']) {
    const value = read(key);
    if (value && isRemoteUrl(value)) {
      return { url: value, authToken: tokenFor(key), local: false, source: key };
    }
  }

  for (const key of Object.keys(process.env)) {
    if (!key.endsWith('DATABASE_URL')) continue;
    const value = read(key);
    if (!value) continue;
    if (!isRemoteUrl(value) && !isTursoHost(value)) continue;
    return { url: value, authToken: tokenFor(key), local: false, source: key };
  }

  const file = databaseFile();
  if (file === ':memory:') return { url: ':memory:', local: true, source: 'memory' };
  const absolute = path.resolve(file);
  // SQLite creates the file but not its directory — on a fresh persistent
  // volume (e.g. DATABASE_URL=/data/nuvra.db) the folder may not exist yet.
  mkdirSync(path.dirname(absolute), { recursive: true });
  return { url: `file:${absolute}`, local: true, source: 'file' };
}

function createDb(): DB {
  const target = databaseTarget();
  const client = createClient({ url: target.url, authToken: target.authToken });

  if (target.local && target.url.startsWith('file:')) {
    // Fire-and-forget: WAL gives us concurrent readers, foreign_keys keeps
    // referential integrity. Both are connection-level settings.
    void client.execute('PRAGMA journal_mode = WAL').catch(() => undefined);
    void client.execute('PRAGMA foreign_keys = ON').catch(() => undefined);
  }

  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as { db?: DB };

export const db: DB = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export { schema };
