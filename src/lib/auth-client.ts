import { createAuthClient } from 'better-auth/react';
import { genericOAuthClient } from 'better-auth/client/plugins';

// Client-side auth for React components
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [genericOAuthClient()],
});

// Export commonly used hooks and methods
export const {
  signIn,
  signOut,
  useSession,
} = authClient;
