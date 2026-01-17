'use client';

import { useState, useEffect, useMemo } from 'react';

interface AdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  isAdmin: boolean;
  onSuccess?: () => void | Promise<void>;
}

interface RosterPlayer {
  playerId: number;
  playerName: string;
  server: string;
  playerClass: string;
  appearances: number;
}

interface TeamConfig {
  id: string;
  name: string;
  attendancePercent: number;
  attendanceIncludeIds: number[] | null;
  attendanceExcludeIds: number[] | null;
}

type ModalState = 'loading' | 'idle' | 'saving' | 'success' | 'error';

// Reuse the same icon components from UploadLogsModal
const ArcaneSpinner = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent animate-pulse" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(218,165,32,0.6)]" />
    </div>
  </div>
);

const SuccessIcon = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/10" style={{ animationDuration: '1.5s' }} />
  </div>
);

const ErrorIcon = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// WoW class colors
const classColors: Record<string, string> = {
  'DeathKnight': 'text-[#C41E3A]',
  'DemonHunter': 'text-[#A330C9]',
  'Druid': 'text-[#FF7C0A]',
  'Evoker': 'text-[#33937F]',
  'Hunter': 'text-[#AAD372]',
  'Mage': 'text-[#3FC7EB]',
  'Monk': 'text-[#00FF98]',
  'Paladin': 'text-[#F48CBA]',
  'Priest': 'text-white',
  'Rogue': 'text-[#FFF468]',
  'Shaman': 'text-[#0070DD]',
  'Warlock': 'text-[#8788EE]',
  'Warrior': 'text-[#C69B6D]',
};

export function AdminConfigModal({ isOpen, onClose, teamId, isAdmin, onSuccess }: AdminConfigModalProps) {
  const [state, setState] = useState<ModalState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Config state
  const [attendancePercent, setAttendancePercent] = useState(20);
  const [includeIds, setIncludeIds] = useState<Set<number>>(new Set());
  const [excludeIds, setExcludeIds] = useState<Set<number>>(new Set());
  const [roster, setRoster] = useState<RosterPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRaidNights, setTotalRaidNights] = useState(0);

  // Fetch config when modal opens
  useEffect(() => {
    if (isOpen) {
      setState('loading');
      fetchConfig();
    }
  }, [isOpen, teamId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setState('loading');
        setErrorMessage('');
        setSearchQuery('');
        setIsClosing(false);
      }, 200);
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/admin`);
      if (!response.ok) {
        throw new Error('Failed to fetch team configuration');
      }
      const data = await response.json() as {
        team: TeamConfig;
        roster: RosterPlayer[];
      };

      setAttendancePercent(Math.round((data.team.attendancePercent ?? 0.2) * 100));
      setIncludeIds(new Set(data.team.attendanceIncludeIds ?? []));
      setExcludeIds(new Set(data.team.attendanceExcludeIds ?? []));
      setRoster(data.roster ?? []);

      // Calculate total raid nights from max appearances
      const maxAppearances = Math.max(...(data.roster?.map((p) => p.appearances) ?? [0]), 1);
      setTotalRaidNights(maxAppearances);

      setState('idle');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load configuration');
      setState('error');
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  };

  const handleIncludeToggle = (playerId: number) => {
    setIncludeIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
        // Remove from exclude if adding to include
        setExcludeIds(ex => {
          const newEx = new Set(ex);
          newEx.delete(playerId);
          return newEx;
        });
      }
      return next;
    });
  };

  const handleExcludeToggle = (playerId: number) => {
    setExcludeIds(prev => {
      const next = new Set(prev);
      if (next.has(playerId)) {
        next.delete(playerId);
      } else {
        next.add(playerId);
        // Remove from include if adding to exclude
        setIncludeIds(inc => {
          const newInc = new Set(inc);
          newInc.delete(playerId);
          return newInc;
        });
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!isAdmin) return;

    setState('saving');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/teams/${teamId}/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendancePercent: attendancePercent / 100,
          attendanceIncludeIds: Array.from(includeIds),
          attendanceExcludeIds: Array.from(excludeIds),
        }),
      });

      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Failed to save configuration');
      }

      setState('success');

      // Call onSuccess callback to refresh parent component data
      if (onSuccess) {
        await onSuccess();
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save configuration');
      setState('error');
    }
  };

  // Filter roster by search
  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;
    const query = searchQuery.toLowerCase();
    return roster.filter(p =>
      p.playerName.toLowerCase().includes(query) ||
      p.playerClass.toLowerCase().includes(query) ||
      p.server.toLowerCase().includes(query)
    );
  }, [roster, searchQuery]);

  // Calculate preview count
  const previewCount = useMemo(() => {
    const threshold = attendancePercent / 100;
    return roster.filter(p => {
      if (excludeIds.has(p.playerId)) return false;
      if (includeIds.has(p.playerId)) return true;
      if (totalRaidNights === 0) return true;
      return (p.appearances / totalRaidNights) >= threshold;
    }).length;
  }, [roster, attendancePercent, includeIds, excludeIds, totalRaidNights]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] ${
          isClosing ? 'modal-content-exit' : 'modal-content-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main card */}
        <div className="mythic-card mythic-card-gold rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Corner ornaments */}
          <div className="mythic-corner-ornament mythic-corner-tl" />
          <div className="mythic-corner-ornament mythic-corner-tr" />
          <div className="mythic-corner-ornament mythic-corner-bl" />
          <div className="mythic-corner-ornament mythic-corner-br" />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 shrink-0">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(218,165,32,0.15)] shrink-0">
                <SettingsIcon />
              </div>
              <div>
                <h2 className="font-[var(--font-cinzel)] text-2xl font-semibold mythic-title">
                  Admin Config
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  Configure attendance thresholds and player overrides
                </p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent shrink-0" />

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto flex-1">
            {state === 'loading' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <ArcaneSpinner />
                </div>
                <p className="text-white/70 font-medium">Loading Configuration</p>
                <p className="text-white/40 text-sm mt-1">
                  Fetching team settings...
                </p>
              </div>
            )}

            {state === 'idle' && (
              <div className="space-y-6">
                {/* Attendance Threshold Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/70">
                      Attendance Threshold
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-400">{attendancePercent}%</span>
                    </div>
                  </div>

                  {/* Custom slider */}
                  <div className="relative h-5 flex items-center">
                    {/* Track background */}
                    <div className="absolute inset-x-0 h-2 rounded-full bg-white/10" />
                    {/* Track fill */}
                    <div
                      className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
                      style={{ width: `${attendancePercent}%` }}
                    />
                    {/* Input */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={attendancePercent}
                      onChange={(e) => setAttendancePercent(Number(e.target.value))}
                      className="
                        relative w-full h-5 appearance-none cursor-pointer bg-transparent z-10
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-5
                        [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-gradient-to-br
                        [&::-webkit-slider-thumb]:from-amber-400
                        [&::-webkit-slider-thumb]:to-amber-600
                        [&::-webkit-slider-thumb]:border-2
                        [&::-webkit-slider-thumb]:border-amber-300/50
                        [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(218,165,32,0.5)]
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:duration-200
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-moz-range-thumb]:w-5
                        [&::-moz-range-thumb]:h-5
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-gradient-to-br
                        [&::-moz-range-thumb]:from-amber-400
                        [&::-moz-range-thumb]:to-amber-600
                        [&::-moz-range-thumb]:border-2
                        [&::-moz-range-thumb]:border-amber-300/50
                        [&::-moz-range-thumb]:border-0
                      "
                    />
                  </div>

                  <p className="text-xs text-white/40">
                    Players must attend at least {attendancePercent}% of raid nights to appear in stats
                  </p>
                </div>

                {/* Preview Count */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 border border-amber-500/20">
                  <span className="text-white/60 text-sm">Players shown with current settings:</span>
                  <span className="text-xl font-bold text-amber-400">
                    {previewCount} <span className="text-white/40 text-sm font-normal">/ {roster.length}</span>
                  </span>
                </div>

                {/* Roster Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/70">
                      Player Overrides
                    </label>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500/50" />
                        <span className="text-white/50">Always Include</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
                        <span className="text-white/50">Always Exclude</span>
                      </span>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none text-white/30">
                      <SearchIcon />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search players..."
                      className="
                        w-full pl-10 pr-4 py-2.5 rounded-xl
                        bg-black/40 text-white placeholder-white/30
                        border border-white/10 text-sm
                        focus:border-amber-500/50 focus:outline-none
                        focus:ring-2 focus:ring-amber-500/20
                        transition-all duration-200
                      "
                    />
                  </div>

                  {/* Roster Table */}
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-amber-500/30 hover:scrollbar-thumb-amber-500/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-amber-500/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-amber-500/50">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-black/60 backdrop-blur-sm">
                          <tr className="text-xs text-white/50 uppercase tracking-wider">
                            <th className="text-left py-3 px-4">Player</th>
                            <th className="text-center py-3 px-2 w-20">Nights</th>
                            <th className="text-center py-3 px-2 w-20">Include</th>
                            <th className="text-center py-3 px-2 w-20">Exclude</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredRoster.map((player) => {
                            const isIncluded = includeIds.has(player.playerId);
                            const isExcluded = excludeIds.has(player.playerId);
                            const meetsThreshold = totalRaidNights > 0
                              ? (player.appearances / totalRaidNights) >= (attendancePercent / 100)
                              : true;
                            const willShow = !isExcluded && (isIncluded || meetsThreshold);

                            const willBeFiltered = !willShow && !isExcluded;

                            return (
                              <tr
                                key={player.playerId}
                                className={`
                                  transition-all duration-200
                                  ${isExcluded ? 'bg-red-500/10' : isIncluded ? 'bg-emerald-500/5' : willBeFiltered ? 'bg-white/[0.02]' : 'hover:bg-white/5'}
                                  ${willBeFiltered ? 'opacity-30' : ''}
                                `}
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-medium ${willBeFiltered ? 'text-white/50 line-through decoration-white/30' : classColors[player.playerClass] || 'text-white'}`}>
                                      {player.playerName}
                                    </span>
                                    <span className="text-xs text-white/30">{player.server}</span>
                                  </div>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <span className="text-sm text-white/60">
                                    {player.appearances}
                                  </span>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <button
                                    onClick={() => handleIncludeToggle(player.playerId)}
                                    className={`
                                      w-6 h-6 rounded-md border transition-all duration-200
                                      flex items-center justify-center
                                      ${isIncluded
                                        ? 'bg-emerald-500/30 border-emerald-500/50 text-emerald-400'
                                        : 'bg-white/5 border-white/20 text-transparent hover:border-emerald-500/30 hover:text-emerald-500/50'
                                      }
                                    `}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                </td>
                                <td className="text-center py-3 px-2">
                                  <button
                                    onClick={() => handleExcludeToggle(player.playerId)}
                                    className={`
                                      w-6 h-6 rounded-md border transition-all duration-200
                                      flex items-center justify-center
                                      ${isExcluded
                                        ? 'bg-red-500/30 border-red-500/50 text-red-400'
                                        : 'bg-white/5 border-white/20 text-transparent hover:border-red-500/30 hover:text-red-500/50'
                                      }
                                    `}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {filteredRoster.length === 0 && (
                        <div className="py-8 text-center text-white/40 text-sm">
                          {searchQuery ? 'No players match your search' : 'No roster data available'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!isAdmin}
                  className="
                    w-full py-3 px-6 rounded-xl
                    font-semibold text-sm uppercase tracking-wider
                    bg-gradient-to-r from-amber-600 to-amber-500
                    text-black/90
                    border border-amber-400/50
                    hover:from-amber-500 hover:to-amber-400
                    hover:shadow-[0_0_30px_rgba(218,165,32,0.3)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    disabled:hover:shadow-none
                    transition-all duration-300
                    flex items-center justify-center gap-2
                  "
                >
                  <SettingsIcon />
                  {isAdmin ? 'Save Configuration' : 'Admin Access Required'}
                </button>

                {!isAdmin && (
                  <p className="text-center text-white/40 text-xs">
                    You need team admin privileges to save changes
                  </p>
                )}
              </div>
            )}

            {state === 'saving' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <ArcaneSpinner />
                </div>
                <p className="text-white/70 font-medium">Saving Configuration</p>
                <p className="text-white/40 text-sm mt-1">
                  Updating team settings...
                </p>
              </div>
            )}

            {state === 'success' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <SuccessIcon />
                </div>
                <p className="text-emerald-400 font-semibold text-lg mb-1">
                  Configuration Saved
                </p>
                <p className="text-white/50 text-sm mb-4">
                  Your changes have been applied successfully
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleClose}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-white/5 text-white/70
                      border border-white/10
                      hover:bg-white/10 hover:text-white
                      transition-all duration-200
                    "
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <ErrorIcon />
                </div>
                <p className="text-red-400 font-semibold text-lg mb-1">
                  Failed to Save
                </p>
                <p className="text-white/50 text-sm mb-4">
                  {errorMessage}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setState('idle')}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-gradient-to-r from-amber-600/80 to-amber-500/80
                      text-black/90
                      border border-amber-400/30
                      hover:from-amber-500 hover:to-amber-400
                      transition-all duration-200
                    "
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-white/5 text-white/70
                      border border-white/10
                      hover:bg-white/10 hover:text-white
                      transition-all duration-200
                    "
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
