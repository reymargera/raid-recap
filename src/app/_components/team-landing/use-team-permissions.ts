'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';

export interface TeamPermissions {
  canUploadLogs: boolean;
  canEditConfig: boolean;
  canSubmitHighlights: boolean;
  canDeleteAnyHighlight: boolean;
  isTeamAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useTeamPermissions(teamId: string) {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<TeamPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    // Reset permissions when session changes to ensure fresh fetch
    setPermissions(null);
    setLoading(true);

    fetch(`/api/teams/${teamId}/permissions`)
      .then(res => res.json() as Promise<TeamPermissions>)
      .then(data => setPermissions(data))
      .catch(() => {
        // On error, default to no permissions
        setPermissions({
          canUploadLogs: false,
          canEditConfig: false,
          canSubmitHighlights: false,
          canDeleteAnyHighlight: false,
          isTeamAdmin: false,
          isSuperAdmin: false,
        });
      })
      .finally(() => setLoading(false));
  }, [teamId, session?.user?.id]);

  return { permissions, loading };
}
