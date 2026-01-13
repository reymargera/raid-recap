import { betterAuth } from 'better-auth';
import { genericOAuth } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDB } from './db';

// Auth configuration for Better Auth with Battle.net OAuth
// Reference: https://oauth.battle.net/.well-known/openid-configuration

interface AuthEnv {
  DB: D1Database;
  BATTLENET_CLIENT_ID: string;
  BATTLENET_CLIENT_SECRET: string;
}

/**
 * Creates a Better Auth instance with Cloudflare D1 database
 * Must be called with env from getCloudflareContext()
 */
export function createAuth(env: AuthEnv) {
  const db = getDB(env.DB);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      usePlural: true,
    }),
    user: {
      additionalFields: {
        isSuperAdmin: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          input: false, // Not settable by user during signup
        },
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true, // Battle.net doesn't provide real emails
      },
    },
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: 'battlenet',
            discoveryUrl: 'https://oauth.battle.net/.well-known/openid-configuration',
            clientId: env.BATTLENET_CLIENT_ID,
            clientSecret: env.BATTLENET_CLIENT_SECRET,
            scopes: ['openid', 'wow.profile'],
            getUserInfo: async (tokens) => {
              const res = await fetch('https://oauth.battle.net/userinfo', {
                headers: { Authorization: `Bearer ${tokens.accessToken}` },
              });
              const data: { sub: string; battletag: string } = await res.json();
              return {
                id: String(data.sub),
                name: data.battletag,
                email: `${data.sub}@battlenet.placeholder`, // Required placeholder
                emailVerified: true,
              };
            },
          },
        ],
      }),
    ],
  });
}

// Type for the auth instance
export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth['$Infer']['Session'];
