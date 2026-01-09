'use client';

import { useState, useMemo } from 'react';
import { ManaforgeOmegaEncounters } from '@/app/_config/encounters';
import { BossStats, BossDifficultyStats, DifficultyValue, DifficultyLevel } from '@/warcraft-logs/model/team-stats';
import {
    CheckCircleIcon,
    SkullIcon,
    TargetIcon,
} from '@/app/_components/shared/stat-components';
import BossDetailsModal from './boss-details-modal';

interface BossProgressionCardProps {
    bossProgression: Map<number, BossStats> | { __type: string; value: [number, BossStats][] } | undefined;
    animationDelay?: number;
    cardsVisible?: boolean;
    trigger?: boolean;
}

const DIFFICULTIES = [
    { value: DifficultyLevel.Mythic, name: 'Mythic', color: 'purple', bgColor: 'from-purple-500/20 to-purple-600/10', borderColor: 'border-purple-500/30', textColor: 'text-purple-400' },
    { value: DifficultyLevel.Heroic, name: 'Heroic', color: 'amber', bgColor: 'from-amber-500/20 to-amber-600/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-400' },
    { value: DifficultyLevel.Normal, name: 'Normal', color: 'green', bgColor: 'from-green-500/20 to-green-600/10', borderColor: 'border-green-500/30', textColor: 'text-green-400' },
] as const;

// Helper to parse serialized Map
function parseProgressionMap(bossProgression: BossProgressionCardProps['bossProgression']): Map<number, BossStats> {
    if (!bossProgression) return new Map<number, BossStats>();
    if (bossProgression instanceof Map) return bossProgression;
    if (typeof bossProgression === 'object' && '__type' in bossProgression && bossProgression.__type === 'Map') {
        return new Map(bossProgression.value);
    }
    return new Map<number, BossStats>();
}

// Helper to parse nested difficulties Map
function parseDifficultiesMap(difficulties: Map<DifficultyValue, BossDifficultyStats> | { __type: string; value: [DifficultyValue, BossDifficultyStats][] }): Map<DifficultyValue, BossDifficultyStats> {
    if (difficulties instanceof Map) return difficulties;
    if (typeof difficulties === 'object' && '__type' in difficulties && difficulties.__type === 'Map') {
        return new Map(difficulties.value);
    }
    return new Map();
}

// Difficulty Toggle Component
const DifficultyToggle = ({
    selectedDifficulty,
    onSelect,
    availableDifficulties,
}: {
    selectedDifficulty: DifficultyValue;
    onSelect: (difficulty: DifficultyValue) => void;
    availableDifficulties: Set<DifficultyValue>;
}) => {
    return (
        <div className="flex gap-2">
            {DIFFICULTIES.map((diff) => {
                const isAvailable = availableDifficulties.has(diff.value);
                const isSelected = selectedDifficulty === diff.value;

                return (
                    <button
                        key={diff.value}
                        onClick={() => isAvailable && onSelect(diff.value)}
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
    );
};

// Boss Row Component
const BossRow = ({
    boss,
    difficultyStats,
    isKilled,
    index,
    animationDelay,
    cardsVisible,
    onClick,
}: {
    boss: { id: number; name: string };
    difficultyStats: BossDifficultyStats | null;
    isKilled: boolean;
    index: number;
    animationDelay: number;
    cardsVisible: boolean;
    onClick: () => void;
}) => {
    const hasAttempts = difficultyStats && (difficultyStats.kills > 0 || difficultyStats.wipes > 0);

    // Format first kill date
    const firstKillDate = difficultyStats?.firstKillTimestamp
        ? new Date(difficultyStats.firstKillTimestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : null;

    return (
        <div
            onClick={onClick}
            className={`
                flex items-center gap-4 p-3 rounded-lg transition-all duration-300
                opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                cursor-pointer hover:scale-[1.02] hover:shadow-lg
                ${isKilled
                    ? 'bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 hover:border-amber-500/40'
                    : hasAttempts
                        ? 'bg-gradient-to-r from-red-500/5 to-transparent border border-red-500/10 hover:border-red-500/30'
                        : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-80 hover:border-white/15'
                }
            `}
            style={{ animationDelay: `${animationDelay + (index * 50)}ms` }}
        >
            {/* Boss Number/Icon */}
            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${isKilled
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : hasAttempts
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-white/30 border border-white/10'
                }
            `}>
                {isKilled ? <CheckCircleIcon /> : hasAttempts ? <SkullIcon /> : index + 1}
            </div>

            {/* Boss Name */}
            <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${isKilled ? 'text-white' : hasAttempts ? 'text-white/80' : 'text-white/50'}`}>
                    {boss.name}
                </div>
                {firstKillDate && (
                    <div className="text-xs text-amber-400/60">
                        First kill: {firstKillDate}
                    </div>
                )}
            </div>

            {/* Stats */}
            {hasAttempts && (
                <div className="flex gap-4 text-sm shrink-0">
                    <div className="text-center">
                        <div className={`font-bold tabular-nums ${isKilled ? 'text-emerald-400' : 'text-white/40'}`}>
                            {difficultyStats?.kills || 0}
                        </div>
                        <div className="text-xs text-white/40">Kills</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-red-400 tabular-nums">
                            {difficultyStats?.wipes || 0}
                        </div>
                        <div className="text-xs text-white/40">Wipes</div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Progression Summary Component
const ProgressionSummary = ({
    progressionMap,
    selectedDifficulty,
}: {
    progressionMap: Map<number, BossStats>;
    selectedDifficulty: DifficultyValue;
}) => {
    const totalBosses = ManaforgeOmegaEncounters.length;

    const killedCount = ManaforgeOmegaEncounters.filter(boss => {
        const bossStats = progressionMap.get(boss.id);
        if (!bossStats) return false;

        const diffs = parseDifficultiesMap(bossStats.difficulties);
        const stats = diffs.get(selectedDifficulty);
        return stats ? stats.kills > 0 : false;
    }).length;

    const difficultyConfig = DIFFICULTIES.find(d => d.value === selectedDifficulty);
    const difficultyName = difficultyConfig?.name || 'Unknown';
    const progressColor = difficultyConfig?.textColor || 'text-amber-400';

    return (
        <div className="flex items-center gap-4">
            <div className="flex-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                            selectedDifficulty === DifficultyLevel.Mythic
                                ? 'bg-gradient-to-r from-purple-500 to-purple-400'
                                : selectedDifficulty === DifficultyLevel.Heroic
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                    : 'bg-gradient-to-r from-green-500 to-green-400'
                        }`}
                        style={{ width: `${(killedCount / totalBosses) * 100}%` }}
                    />
                </div>
            </div>
            <div className="text-sm shrink-0">
                <span className={`font-bold ${progressColor}`}>{killedCount}/{totalBosses}</span>
                <span className="text-white/50 ml-1">{difficultyName}</span>
            </div>
        </div>
    );
};

// Section Header Component
const SectionHeader = ({ children, rightContent }: { children: React.ReactNode; rightContent?: React.ReactNode }) => (
    <div className="mb-5">
        <div className="flex items-center justify-between">
            <h2 className="font-[var(--font-cinzel)] text-xl font-semibold text-white/90 tracking-wide">
                {children}
            </h2>
            {rightContent}
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
    </div>
);

export default function BossProgressionCard({
    bossProgression,
    animationDelay = 100,
    cardsVisible = false,
}: BossProgressionCardProps) {
    // Parse serialized Map if needed
    const progressionMap = useMemo(() => parseProgressionMap(bossProgression), [bossProgression]);

    // Modal state for selected boss
    const [selectedBoss, setSelectedBoss] = useState<{ id: number; name: string } | null>(null);

    // Determine available difficulties and highest with kills
    const { availableDifficulties, highestKilledDifficulty } = useMemo(() => {
        const available = new Set<DifficultyValue>();
        let highestKilled: DifficultyValue = DifficultyLevel.Normal;

        for (const bossStats of progressionMap.values()) {
            const diffs = parseDifficultiesMap(bossStats.difficulties);

            for (const [diff, stats] of diffs) {
                if (stats.kills > 0 || stats.wipes > 0) {
                    available.add(diff);
                    if (stats.kills > 0 && diff > highestKilled) {
                        highestKilled = diff;
                    }
                }
            }
        }

        // If no data available, default to showing Heroic as an option
        if (available.size === 0) {
            available.add(DifficultyLevel.Heroic);
        }

        return { availableDifficulties: available, highestKilledDifficulty: highestKilled };
    }, [progressionMap]);

    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyValue>(highestKilledDifficulty);

    // Get boss stats for selected difficulty
    const getBossStats = (encounterId: number): BossDifficultyStats | null => {
        const bossStats = progressionMap.get(encounterId);
        if (!bossStats) return null;

        const diffs = parseDifficultiesMap(bossStats.difficulties);
        return diffs.get(selectedDifficulty) || null;
    };

    return (
        <div
            className={`
                mythic-card rounded-2xl p-5 lg:p-6
                opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
            `}
            style={{ animationDelay: `${animationDelay}ms` }}
        >
            {/* Corner ornaments */}
            <div className="mythic-corner-ornament mythic-corner-tl" />
            <div className="mythic-corner-ornament mythic-corner-tr" />
            <div className="mythic-corner-ornament mythic-corner-bl" />
            <div className="mythic-corner-ornament mythic-corner-br" />

            <div className="relative z-10">
                {/* Header with Difficulty Toggle */}
                <SectionHeader
                    rightContent={
                        <DifficultyToggle
                            selectedDifficulty={selectedDifficulty}
                            onSelect={setSelectedDifficulty}
                            availableDifficulties={availableDifficulties}
                        />
                    }
                >
                    Boss Progression
                </SectionHeader>

                {/* Boss List */}
                <div className="space-y-2 mb-4">
                    {ManaforgeOmegaEncounters.map((boss, index) => {
                        const stats = getBossStats(boss.id);
                        const isKilled = stats ? stats.kills > 0 : false;

                        return (
                            <BossRow
                                key={boss.id}
                                boss={boss}
                                difficultyStats={stats}
                                isKilled={isKilled}
                                index={index}
                                animationDelay={animationDelay + 100}
                                cardsVisible={cardsVisible}
                                onClick={() => setSelectedBoss(boss)}
                            />
                        );
                    })}
                </div>

                {/* Progression Summary */}
                <div className="pt-4 border-t border-white/10">
                    <ProgressionSummary
                        progressionMap={progressionMap}
                        selectedDifficulty={selectedDifficulty}
                    />
                </div>
            </div>

            {/* Boss Details Modal */}
            {selectedBoss && (
                <BossDetailsModal
                    boss={selectedBoss}
                    bossStats={progressionMap.get(selectedBoss.id)}
                    onClose={() => setSelectedBoss(null)}
                />
            )}
        </div>
    );
}
