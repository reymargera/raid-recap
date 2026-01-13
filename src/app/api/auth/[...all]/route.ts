import { toNextJsHandler } from 'better-auth/next-js';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createAuth } from '@/lib/auth';

// Better Auth API route handler
// Handles: /api/auth/signin, /api/auth/callback, /api/auth/session, etc.

export async function GET(request: Request) {
  const { env } = getCloudflareContext();
  const auth = createAuth(env);
  const handler = toNextJsHandler(auth);
  return handler.GET(request);
}

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const auth = createAuth(env);
  const handler = toNextJsHandler(auth);
  return handler.POST(request);
}
