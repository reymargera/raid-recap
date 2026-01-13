'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';

export function AuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <button
        disabled
        className="px-4 py-2 text-sm text-gray-400 bg-gray-800 rounded-lg cursor-wait"
      >
        Loading...
      </button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">
          {session.user.name}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        signIn.oauth2({
          providerId: 'battlenet',
          callbackURL: window.location.href,
        })
      }
      className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
    >
      <BattleNetIcon />
      Sign in with Battle.net
    </button>
  );
}

function BattleNetIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4z" />
    </svg>
  );
}
