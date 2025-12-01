import type { Config } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler/state/v3/d1');
    const files = fs.readdirSync(basePath, { encoding: 'utf-8', recursive: true });
    const dbFile = files.find((f) => f.endsWith('.sqlite'));

    if (!dbFile) {
      throw new Error('.sqlite file not found in .wrangler/state/v3/d1');
    }

    const fullPath = path.resolve(basePath, dbFile);
    console.log('Using local D1 database:', fullPath);
    return fullPath;
  } catch (err) {
    console.error(`Error finding local D1 database: ${err instanceof Error ? err.message : err}`);
    throw err;
  }
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  ...(process.env.NODE_ENV === 'production'
    ? {
        driver: 'd1-http',
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
          token: process.env.CLOUDFLARE_D1_API_TOKEN!,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
} satisfies Config;
