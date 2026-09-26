import { defineConfig } from 'drizzle-kit';
import { databaseTarget } from './src/lib/db';

// Same resolution as the application (src/lib/db.ts): Turso / hosted libSQL
// when a connection string is configured, local file otherwise.
const target = databaseTarget();

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: target.url,
    authToken: target.authToken,
  },
  strict: true,
  verbose: true,
});
