'use client';

import { useState, useEffect } from 'react';

export interface TeamPermissions {
  canUploadLogs: boolean;
  canEditConfig: boolean;
  isTeamAdmin: boolean;
  isSuperAdmin: boolean;
}

export function useTeamPermissions(teamId: string) {
  const [permissions, setPermissions] = useState<TeamPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    fetch(`/api/teams/${teamId}/permissions`)
      .then(res => res.json() as Promise<TeamPermissions>)
      .then(data => setPermissions(data))
      .catch(() => {
        // On error, default to no permissions
        setPermissions({
          canUploadLogs: false,
          canEditConfig: false,
          isTeamAdmin: false,
          isSuperAdmin: false,
        });
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  return { permissions, loading };
}
