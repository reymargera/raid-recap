import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'raid-recap-db',
  },
} satisfies Config;
