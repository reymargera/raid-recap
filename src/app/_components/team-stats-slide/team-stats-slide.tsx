'use client';

import { TeamStats } from "@/warcraft-logs/model/team-stats";
import { publicBase } from "@/app/_config/paths";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import {
    Tooltip,
    formatTime,
    formatPercentage,
    AnimatedTimeCounter,
    AnimatedNumberCounter,
    DPSMeterBar,
    CalendarIcon,
    ClockIcon,
    SwordIcon,
    TargetIcon,
    RefreshIcon,
    AlertIcon,
    UsersIcon,
    StarIcon,
    BookIcon,
    TrophyIcon,
    LightningIcon,
    SkullIcon,
    CheckCircleIcon
} from "@/app/_components/shared/stat-components";

export interface TeamStatsSlideProps {
    teamStats: TeamStats;
    teamName: string;
}

export default function TeamStatsSlide({ teamStats, teamName }: TeamStatsSlideProps) {
    const topDamageTaken = teamStats.getTopDamageTakenAbilities(5);
    const topDeathAbilities = teamStats.getTopDeathAbilities(5);
    const [animationTrigger, setAnimationTrigger] = useState(false);
    const slideRef = useRef<HTMLDivElement>(null);

    // Trigger animation when slide becomes visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        // Reset and trigger animation when slide becomes visible
                        setAnimationTrigger(false);
                        setTimeout(() => {
                            setAnimationTrigger(true);
                        }, 100);
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of slide is visible
                rootMargin: '0px'
            }
        );

        if (slideRef.current) {
            observer.observe(slideRef.current);
        }

        return () => {
            if (slideRef.current) {
                observer.unobserve(slideRef.current);
            }
        };
    }, []);

    return (
        <div className="team-inforgraphic-container" ref={slideRef}>
            <div className="min-h-screen flex flex-col relative">
                <Image
                    src={`${publicBase}/backgrounds/manaforge/manaforge-broll-4.webp`}
                    alt="Team Stats Background"
                    className="slide-background object-cover object-center"
                    fill={true}
                />
                <div className="flex flex-col p-4 relative z-10 flex-1 font-[var(--font-outfit)]">
                    <div className="award-heading mb-4 py-4">
                        <h1 className="font-[var(--font-cinzel)] text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide mythic-title text-center mb-2">
                            Season Overview
                        </h1>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                            <div className="w-2 h-2 rotate-45 bg-amber-500/60" />
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto flex-1">
                        {/* Raid Summary */}
                        <div className="mythic-card rounded-2xl p-4 lg:p-5">
                            <h2 className="font-[var(--font-cinzel)] text-xl lg:text-2xl font-semibold text-white/90 tracking-wide mb-1">
                                Raid Summary
                            </h2>
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-3" />
                            <div className="space-y-3">
                                {/* First row: Raid Nights, Total Pulls, Boss Kills */}
                                <div className="grid grid-cols-3 gap-3">
                                    <Tooltip content="Only includes raid nights that were logged. If it's not logged, it doesn't exist!">
                                        <div className="text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-3 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 cursor-help">
                                            <div className="flex justify-center mb-3">
                                                <CalendarIcon />
                                            </div>
                                            <div className="text-4xl font-extrabold text-blue-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                                <div className="tabular-nums">
                                                    <AnimatedNumberCounter endValue={teamStats.totalRaidNights} delay={100} trigger={animationTrigger} />
                                                </div>
                                            </div>
                                            <div className="text-xs text-blue-200 font-medium uppercase tracking-wide">Raid Nights</div>
                                        </div>
                                    </Tooltip>
                                    <Tooltip content="Only counts boss pulls. Does not include resets or trash mob encounters.">
                                        <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 cursor-help">
                                            <div className="flex justify-center mb-3">
                                                <TargetIcon />
                                            </div>
                                            <div className="text-4xl font-extrabold text-purple-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                                <div className="tabular-nums">
                                                    <AnimatedNumberCounter endValue={teamStats.totalPulls} delay={200} trigger={animationTrigger} />
                                                </div>
                                            </div>
                                            <div className="text-sm text-purple-200 font-medium uppercase tracking-wide">Total Pulls</div>
                                        </div>
                                    </Tooltip>
                                    <div className="text-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-3 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-3">
                                            <CheckCircleIcon />
                                        </div>
                                        <div className="text-4xl font-extrabold text-emerald-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                            <div className="tabular-nums">
                                                <AnimatedNumberCounter endValue={teamStats.totalBossKills} delay={300} trigger={animationTrigger} />
                                            </div>
                                        </div>
                                        <div className="text-sm text-emerald-200 font-medium uppercase tracking-wide">Boss Kills</div>
                                    </div>
                                </div>

                                {/* Second row: Resets, Failed Resets */}
                                <div className={`grid gap-3 ${teamStats.totalFailedResets > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    <div className="text-center bg-gradient-to-br from-red-500/20 to-red-600/20 p-3 rounded-xl border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-3">
                                            <RefreshIcon />
                                        </div>
                                        <div className="text-4xl font-extrabold text-red-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                            <div className="tabular-nums">
                                                <AnimatedNumberCounter endValue={teamStats.totalResets} delay={400} trigger={animationTrigger} />
                                            </div>
                                        </div>
                                        <div className="text-sm text-red-200 font-medium uppercase tracking-wide">Resets</div>
                                    </div>
                                    {teamStats.totalFailedResets > 0 && (
                                        <Tooltip content="Attempted resets that resulted in raid deaths. Boss fights under 1 minute with boss at 98%+ health that ended in a wipe.">
                                            <div className="text-center bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-3 rounded-xl border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300 cursor-help">
                                                <div className="flex justify-center mb-3">
                                                    <AlertIcon />
                                                </div>
                                                <div className="text-4xl font-extrabold text-orange-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                                    <div className="tabular-nums">
                                                        <AnimatedNumberCounter endValue={teamStats.totalFailedResets} delay={500} trigger={animationTrigger} />
                                                    </div>
                                                </div>
                                                <div className="text-sm text-orange-200 font-medium uppercase tracking-wide">Failed Resets</div>
                                            </div>
                                        </Tooltip>
                                    )}
                                </div>

                                {/* Third row: Total Time, Boss Pull Time */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Tooltip content="Time calculated from first pull to last pull of each raid night. Includes breaks and downtime between pulls.">
                                        <div className="text-center bg-gradient-to-br from-green-500/20 to-green-600/20 p-3 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300 cursor-help">
                                            <div className="flex justify-center mb-3">
                                                <ClockIcon />
                                            </div>
                                            <div className="text-4xl font-extrabold text-green-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                                <div className="tabular-nums">
                                                    <AnimatedTimeCounter endValue={teamStats.totalTime} delay={600} trigger={animationTrigger} />
                                                </div>
                                            </div>
                                            <div className="text-sm text-green-200 font-medium uppercase tracking-wide">Total Time</div>
                                        </div>
                                    </Tooltip>
                                    <div className="text-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-3 rounded-xl border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-3">
                                            <SwordIcon />
                                        </div>
                                        <div className="text-4xl font-extrabold text-yellow-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                            <div className="tabular-nums">
                                                <AnimatedTimeCounter endValue={teamStats.timeSpentPullingBosses} delay={700} trigger={animationTrigger} />
                                            </div>
                                        </div>
                                        <div className="text-sm text-yellow-200 font-medium uppercase tracking-wide">Boss Pull Time</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notable Fights */}
                        <div className="mythic-card rounded-2xl p-4 lg:p-5">
                            <h2 className="font-[var(--font-cinzel)] text-xl lg:text-2xl font-semibold text-white/90 tracking-wide mb-1">
                                Notable Fights
                            </h2>
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-3" />
                            <div className="space-y-2">
                                {teamStats.longestBossFightKill.name !== 'Placeholder' && (
                                    <div className="text-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-4 rounded-xl border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-1">
                                            <TrophyIcon />
                                        </div>
                                        <div className="text-sm text-yellow-200 font-medium uppercase tracking-wide">Longest Kill</div>
                                        <div className="text-white font-semibold mb-1">{teamStats.longestBossFightKill.name}</div>
                                        <div className="text-3xl font-extrabold text-yellow-400 mb-1">
                                            <AnimatedTimeCounter endValue={teamStats.longestBossFightKill.duration} delay={1100} trigger={animationTrigger} />
                                        </div>
                                        <div className="text-sm text-yellow-200">{teamStats.longestBossFightKill.difficulty}</div>
                                    </div>
                                )}
                                {teamStats.shortestBossFightKill.name !== 'Placeholder' && teamStats.shortestBossFightKill.duration !== Number.MAX_VALUE && (
                                    <div className="text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-1">
                                            <LightningIcon />
                                        </div>
                                        <div className="text-sm text-blue-200 font-medium uppercase tracking-wide">Shortest Kill</div>
                                        <div className="text-white font-semibold mb-1">{teamStats.shortestBossFightKill.name}</div>
                                        <div className="text-3xl font-extrabold text-blue-400 mb-1">
                                            <AnimatedTimeCounter endValue={teamStats.shortestBossFightKill.duration} delay={1200} trigger={animationTrigger} />
                                        </div>
                                        <div className="text-sm text-blue-200">{teamStats.shortestBossFightKill.difficulty}</div>
                                    </div>
                                )}
                                {teamStats.lowestWipePercentage.name !== 'Placeholder' && teamStats.lowestWipePercentage.fightPercentage < 100 && (
                                    <div className="text-center bg-gradient-to-br from-red-500/20 to-red-600/20 p-4 rounded-xl border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-1">
                                            <SkullIcon />
                                        </div>
                                        <div className="text-sm text-red-200 font-medium uppercase tracking-wide">Closest Wipe</div>
                                        <div className="text-white font-semibold mb-1">{teamStats.lowestWipePercentage.name}</div>
                                        <div className="text-3xl font-extrabold text-red-400 mb-1">
                                            {formatPercentage(teamStats.lowestWipePercentage.fightPercentage)}
                                        </div>
                                        <div className="text-sm text-red-200">{teamStats.lowestWipePercentage.difficulty}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Composition */}
                        <div className="mythic-card rounded-2xl p-4 lg:p-5">
                            <h2 className="font-[var(--font-cinzel)] text-xl lg:text-2xl font-semibold text-white/90 tracking-wide mb-1">
                                Team Composition
                            </h2>
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-3" />
                            <div className="grid grid-cols-3 gap-3">
                                <Tooltip content="Anyone who participated in any pull. Includes core team members and friendly pugs who joined raids.">
                                    <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 cursor-help">
                                        <div className="flex justify-center mb-3">
                                            <UsersIcon />
                                        </div>
                                        <div className="text-4xl font-extrabold text-purple-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                            <div className="tabular-nums">
                                                <AnimatedNumberCounter endValue={teamStats.uniqueCharacters.size} delay={800} trigger={animationTrigger} />
                                            </div>
                                        </div>
                                        <div className="text-sm text-purple-200 font-medium uppercase tracking-wide">Unique Players</div>
                                    </div>
                                </Tooltip>
                                <div className="text-center bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-3 rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <StarIcon />
                                    </div>
                                    <div className="text-4xl font-extrabold text-cyan-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                        <div className="tabular-nums">
                                            <AnimatedNumberCounter endValue={teamStats.uniqueSpecs.size} delay={900} trigger={animationTrigger} />
                                        </div>
                                    </div>
                                    <div className="text-sm text-cyan-200 font-medium uppercase tracking-wide">Unique Specs</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-pink-500/20 to-pink-600/20 p-3 rounded-xl border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <BookIcon />
                                    </div>
                                    <div className="text-4xl font-extrabold text-pink-400 mb-1 min-h-[3rem] flex items-center justify-center">
                                        <div className="tabular-nums">
                                            <AnimatedNumberCounter endValue={teamStats.uniqueTalentLoadouts.size} delay={1000} trigger={animationTrigger} />
                                        </div>
                                    </div>
                                    <div className="text-sm text-pink-200 font-medium uppercase tracking-wide">Talent Builds</div>
                                </div>
                            </div>
                        </div>

                        {/* Most Dangerous Abilities */}
                        <div className="mythic-card rounded-2xl p-4 lg:p-5">
                            <h2 className="font-[var(--font-cinzel)] text-xl lg:text-2xl font-semibold text-white/90 tracking-wide mb-1">
                                Damage Report
                            </h2>
                            <div className="h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent mb-3" />
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-white-400 mb-3 flex items-center">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mr-2"></div>
                                        Top Damage Sources
                                    </div>
                                    {topDamageTaken.slice(0, 3).map((ability, index) => (
                                        <DPSMeterBar
                                            key={`damage-${ability.guid}`}
                                            ability={ability.name}
                                            value={ability.total}
                                            maxValue={topDamageTaken[0]?.total || 1}
                                            index={index}
                                            trigger={animationTrigger}
                                            isDeathCount={false}
                                        />
                                    ))}
                                </div>
                                <div>
                                    <div className="text-sm text-white-400 mb-3 flex items-center">
                                        <div className="w-3 h-3 bg-gradient-to-r from-red-600 to-red-700 rounded-full mr-2"></div>
                                        Top Death Causes
                                    </div>
                                    {topDeathAbilities.slice(0, 5).map((ability, index) => (
                                        <DPSMeterBar
                                            key={`death-${ability.guid}`}
                                            ability={ability.name}
                                            value={ability.count}
                                            maxValue={topDeathAbilities[0]?.count || 1}
                                            index={index}
                                            trigger={animationTrigger}
                                            isDeathCount={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
