'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { BossStats, BossDifficultyStats, DifficultyValue, DifficultyLevel } from '@/warcraft-logs/model/team-stats';
import { formatTime } from '@/app/_components/shared/stat-components';

interface BossDetailsModalProps {
    boss: { id: number; name: string };
    bossStats: BossStats | undefined;
    onClose: () => void;
}

const DIFFICULTIES = [
    { value: DifficultyLevel.Mythic, name: 'Mythic', color: 'purple', bgColor: 'from-purple-500/20 to-purple-600/10', borderColor: 'border-purple-500/30', textColor: 'text-purple-400', barColor: 'from-purple-500 to-purple-400' },
    { value: DifficultyLevel.Heroic, name: 'Heroic', color: 'amber', bgColor: 'from-amber-500/20 to-amber-600/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400', barColor: 'from-amber-500 to-amber-400' },
    { value: DifficultyLevel.Normal, name: 'Normal', color: 'green', bgColor: 'from-green-500/20 to-green-600/10', borderColor: 'border-green-500/30', textColor: 'text-green-400', barColor: 'from-green-500 to-green-400' },
] as const;

// Helper to parse nested difficulties Map
function parseDifficultiesMap(difficulties: Map<DifficultyValue, BossDifficultyStats> | { __type: string; value: [DifficultyValue, BossDifficultyStats][] } | undefined): Map<DifficultyValue, BossDifficultyStats> {
    if (!difficulties) return new Map();
    if (difficulties instanceof Map) return difficulties;
    if (typeof difficulties === 'object' && '__type' in difficulties && difficulties.__type === 'Map') {
        return new Map(difficulties.value);
    }
    return new Map();
}

// Format duration for display (more detailed than formatTime)
function formatDuration(milliseconds: number | null): string {
    if (milliseconds === null || milliseconds === 0) return '-';

    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

// Format date for display
function formatDate(timestamp: number | null): string {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Stat Box Component
const StatBox = ({
    label,
    value,
    subValue,
    glowClass,
    animationDelay
}: {
    label: string;
    value: string | number;
    subValue?: string;
    glowClass?: string;
    animationDelay: number;
}) => (
    <div
        className={`
            mythic-stat-box opacity-0 animate-fade-in-up
            ${glowClass || ''}
        `}
        style={{ animationDelay: `${animationDelay}ms` }}
    >
        <div className="text-xs text-white/50 uppercase tracking-wider mb-1">{label}</div>
        <div className="text-xl font-bold text-white tabular-nums">{value}</div>
        {subValue && <div className="text-xs text-white/40 mt-0.5">{subValue}</div>}
    </div>
);

// Difficulty Progress Bar for All Difficulties Summary
const DifficultyProgressBar = ({
    difficultyConfig,
    stats,
    animationDelay
}: {
    difficultyConfig: typeof DIFFICULTIES[number];
    stats: BossDifficultyStats | null;
    animationDelay: number;
}) => {
    const kills = stats?.kills || 0;
    const wipes = stats?.wipes || 0;
    const totalPulls = kills + wipes;
    const killRate = totalPulls > 0 ? (kills / totalPulls) * 100 : 0;

    return (
        <div
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            <div className="flex items-center gap-3 mb-1">
                <span className={`text-xs font-medium ${difficultyConfig.textColor} w-14`}>
                    {difficultyConfig.name}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${difficultyConfig.barColor} transition-all duration-700 ease-out`}
                        style={{ width: `${killRate}%` }}
                    />
                </div>
                <span className="text-xs text-white/60 w-28 text-right tabular-nums">
                    {kills > 0 || wipes > 0 ? (
                        <>{kills} kills / {wipes} wipes</>
                    ) : (
                        <span className="text-white/30">No attempts</span>
                    )}
                </span>
            </div>
        </div>
    );
};

// Close Icon
const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function BossDetailsModal({ boss, bossStats, onClose }: BossDetailsModalProps) {
    const [isClosing, setIsClosing] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Parse difficulties map
    const difficultiesMap = useMemo(() =>
        parseDifficultiesMap(bossStats?.difficulties),
        [bossStats?.difficulties]
    );

    // Determine available difficulties and highest with kills
    const { availableDifficulties, initialDifficulty } = useMemo(() => {
        const available = new Set<DifficultyValue>();
        let highestKilled: DifficultyValue = DifficultyLevel.Normal;

        for (const [diff, stats] of difficultiesMap) {
            if (stats.kills > 0 || stats.wipes > 0) {
                available.add(diff);
                if (stats.kills > 0 && diff > highestKilled) {
                    highestKilled = diff;
                }
            }
        }

        // If no data available, default to showing Heroic
        if (available.size === 0) {
            available.add(DifficultyLevel.Heroic);
        }

        return { availableDifficulties: available, initialDifficulty: highestKilled };
    }, [difficultiesMap]);

    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyValue>(initialDifficulty);

    // Get stats for selected difficulty
    const currentStats = difficultiesMap.get(selectedDifficulty) || null;

    // Calculate derived stats
    const totalPulls = currentStats ? currentStats.kills + currentStats.wipes : 0;
    const killRate = totalPulls > 0 ? ((currentStats?.kills || 0) / totalPulls * 100).toFixed(1) : '0.0';
    const avgPullTime = totalPulls > 0 && currentStats?.totalPullTime
        ? Math.round(currentStats.totalPullTime / totalPulls)
        : null;

    // Get first kill date across all difficulties
    const firstKillDate = useMemo(() => {
        let earliest: number | null = null;
        for (const stats of difficultiesMap.values()) {
            if (stats.firstKillTimestamp !== null) {
                if (earliest === null || stats.firstKillTimestamp < earliest) {
                    earliest = stats.firstKillTimestamp;
                }
            }
        }
        return earliest;
    }, [difficultiesMap]);

    // Close with animation
    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 150);
    }, [onClose]);

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [handleClose]);

    // Body scroll lock
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // Mount state for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const difficultyConfig = DIFFICULTIES.find(d => d.value === selectedDifficulty);
    const hasKills = currentStats ? currentStats.kills > 0 : false;
    const hasAttempts = currentStats ? currentStats.kills > 0 || currentStats.wipes > 0 : false;

    const modalContent = (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'}`}
            onClick={handleClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Container */}
            <div
                className={`
                    relative mythic-card rounded-2xl p-6 w-full max-w-md
                    ${isClosing ? 'modal-content-exit' : 'modal-content-enter'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Corner ornaments */}
                <div className="mythic-corner-ornament mythic-corner-tl" />
                <div className="mythic-corner-ornament mythic-corner-tr" />
                <div className="mythic-corner-ornament mythic-corner-bl" />
                <div className="mythic-corner-ornament mythic-corner-br" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                                ${hasKills
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : hasAttempts
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                }
                            `}>
                                {hasKills ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : hasAttempts ? (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                                    </svg>
                                ) : '?'}
                            </div>
                            <div>
                                <h2 className="font-[var(--font-cinzel)] text-lg font-semibold text-white/90 tracking-wide">
                                    {boss.name}
                                </h2>
                                {firstKillDate && (
                                    <div className="text-xs text-amber-400/60">
                                        First killed: {formatDate(firstKillDate)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-4" />

                    {/* Difficulty Toggle */}
                    <div className="flex justify-center gap-2 mb-5">
                        {DIFFICULTIES.map((diff) => {
                            const isAvailable = availableDifficulties.has(diff.value);
                            const isSelected = selectedDifficulty === diff.value;

                            return (
                                <button
                                    key={diff.value}
                                    onClick={() => isAvailable && setSelectedDifficulty(diff.value)}
                                    disabled={!isAvailable}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider
                                        transition-all duration-200
                                        ${isSelected
                                            ? `bg-gradient-to-r ${diff.bgColor} ${diff.borderColor} border ${diff.textColor}`
                                            : isAvailable
                                                ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80'
                                                : 'bg-white/[0.02] border border-white/5 text-white/20 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    {diff.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <StatBox
                            label="Kills"
                            value={currentStats?.kills || 0}
                            glowClass={hasKills ? 'mythic-glow-emerald' : ''}
                            animationDelay={50}
                        />
                        <StatBox
                            label="Wipes"
                            value={currentStats?.wipes || 0}
                            glowClass={(currentStats?.wipes || 0) > 0 ? 'mythic-glow-red' : ''}
                            animationDelay={100}
                        />
                        <StatBox
                            label="Kill Rate"
                            value={`${killRate}%`}
                            animationDelay={150}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <StatBox
                            label="Best Kill"
                            value={formatDuration(currentStats?.bestKillDuration || null)}
                            glowClass={currentStats?.bestKillDuration ? `mythic-glow-${difficultyConfig?.color}` : ''}
                            animationDelay={200}
                        />
                        <StatBox
                            label="Avg Pull"
                            value={formatDuration(avgPullTime)}
                            animationDelay={250}
                        />
                        <StatBox
                            label="Time Invested"
                            value={formatTime(currentStats?.totalPullTime || 0)}
                            animationDelay={300}
                        />
                    </div>

                    {/* Best Wipe (only show if no kills for this difficulty) */}
                    {!hasKills && currentStats?.bestWipePercentage !== null && currentStats?.bestWipePercentage !== undefined && (
                        <div
                            className="mb-4 p-3 rounded-lg bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 opacity-0 animate-fade-in-up"
                            style={{ animationDelay: '350ms' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
                                    </svg>
                                    <span className="text-xs text-white/60 uppercase tracking-wider">Best Wipe</span>
                                </div>
                                <span className="text-lg font-bold text-red-400 tabular-nums">
                                    {currentStats.bestWipePercentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-xs text-white/40 mt-1">
                                Closest attempt to killing this boss
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-4" />

                    {/* All Difficulties Summary */}
                    <div>
                        <h3 className="text-xs text-white/50 uppercase tracking-wider mb-3">All Difficulties</h3>
                        <div className="space-y-2">
                            {DIFFICULTIES.map((diff, index) => {
                                const stats = difficultiesMap.get(diff.value) || null;
                                return (
                                    <DifficultyProgressBar
                                        key={diff.value}
                                        difficultyConfig={diff}
                                        stats={stats}
                                        animationDelay={400 + (index * 50)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
