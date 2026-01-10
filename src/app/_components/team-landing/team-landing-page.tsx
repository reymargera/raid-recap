'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { publicBase } from "@/app/_config/paths";
import {
    Tooltip,
    formatTime,
    formatPercentage,
    AnimatedTimeCounter,
    AnimatedNumberCounter,
    CalendarIcon,
    ClockIcon,
    SwordIcon,
    TargetIcon,
    RefreshIcon,
    UsersIcon,
    StarIcon,
    TrophyIcon,
    LightningIcon,
    SkullIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    HomeIcon
} from "@/app/_components/shared/stat-components";
import { getTeamHighlights } from "@/app/_config/highlights";
import HighlightsSection from "./highlights-section";
import BossProgressionCard from "./boss-progression-card";
import { BossStats } from "@/warcraft-logs/model/team-stats";

interface FightOverview {
    name: string;
    difficulty: string;
    duration: number;
    kill: boolean;
    fightPercentage: number;
}

interface TeamStatsData {
    totalRaidNights: number;
    totalBossKills: number;
    totalTime: number;
    totalPulls: number;
    totalResets: number;
    timeSpentPullingBosses: number;
    uniqueCharacters: { __type: string; value: string[] } | Set<string>;
    uniqueSpecs: { __type: string; value: string[] } | Set<string>;
    longestBossFightKill: FightOverview;
    shortestBossFightKill: FightOverview;
    lowestWipePercentage: FightOverview;
    bossProgression?: Map<number, BossStats> | { __type: string; value: [number, BossStats][] };
}

interface TeamData {
    id: string;
    name: string;
    guildId: number;
}

export interface TeamLandingPageProps {
    team: TeamData;
    teamStats: TeamStatsData | null;
}

// Helper to get size from Set or serialized Set
function getSetSize(set: { __type: string; value: string[] } | Set<string> | undefined): number {
    if (!set) return 0;
    if (set instanceof Set) return set.size;
    if (typeof set === 'object' && '__type' in set && set.__type === 'Set' && Array.isArray(set.value)) {
        return set.value.length;
    }
    return 0;
}

// Decorative separator component
const MythicSeparator = () => (
    <div className="flex items-center justify-center gap-3 my-2">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="w-1.5 h-1.5 rotate-45 bg-amber-500/60" />
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
    </div>
);

// Card section header
const SectionHeader = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-5">
        <h2 className="font-[var(--font-cinzel)] text-xl font-semibold text-white/90 tracking-wide">
            {children}
        </h2>
        <div className="mt-2 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
    </div>
);

// Stat box component with glow effect
const StatBox = ({
    icon,
    value,
    label,
    color,
    delay,
    trigger,
    isTime = false,
    tooltip
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    color: 'blue' | 'emerald' | 'purple' | 'cyan' | 'gold' | 'red' | 'green';
    delay: number;
    trigger: boolean;
    isTime?: boolean;
    tooltip?: string;
}) => {
    const colorClasses = {
        blue: 'mythic-glow-blue text-blue-400',
        emerald: 'mythic-glow-emerald text-emerald-400',
        purple: 'mythic-glow-purple text-purple-400',
        cyan: 'mythic-glow-cyan text-cyan-400',
        gold: 'mythic-glow-gold text-amber-400',
        red: 'mythic-glow-red text-red-400',
        green: 'mythic-glow-emerald text-green-400',
    };

    const labelColors = {
        blue: 'text-blue-300/70',
        emerald: 'text-emerald-300/70',
        purple: 'text-purple-300/70',
        cyan: 'text-cyan-300/70',
        gold: 'text-amber-300/70',
        red: 'text-red-300/70',
        green: 'text-green-300/70',
    };

    const content = (
        <div className={`mythic-stat-box ${colorClasses[color]} ${tooltip ? 'cursor-help' : ''}`}>
            <div className="flex justify-center mb-3 opacity-80">
                {icon}
            </div>
            <div className={`text-3xl lg:text-4xl font-bold tabular-nums tracking-tight ${colorClasses[color].split(' ')[1]}`}>
                {isTime ? (
                    <AnimatedTimeCounter endValue={value} delay={delay} trigger={trigger} />
                ) : (
                    <AnimatedNumberCounter endValue={value} delay={delay} trigger={trigger} />
                )}
            </div>
            <div className={`text-xs font-medium uppercase tracking-widest mt-1 ${labelColors[color]}`}>
                {label}
            </div>
        </div>
    );

    if (tooltip) {
        return <Tooltip content={tooltip}>{content}</Tooltip>;
    }
    return content;
};

// Fight highlight card
const FightCard = ({
    icon,
    label,
    bossName,
    value,
    difficulty,
    color,
    delay,
    trigger,
    isPercentage = false
}: {
    icon: React.ReactNode;
    label: string;
    bossName: string;
    value: number;
    difficulty: string;
    color: 'gold' | 'blue' | 'red';
    delay: number;
    trigger: boolean;
    isPercentage?: boolean;
}) => {
    const colorClasses = {
        gold: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/40',
        blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40',
        red: 'from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40',
    };

    const textColors = {
        gold: 'text-amber-400',
        blue: 'text-blue-400',
        red: 'text-red-400',
    };

    const labelColors = {
        gold: 'text-amber-300/60',
        blue: 'text-blue-300/60',
        red: 'text-red-300/60',
    };

    return (
        <div className={`
            relative overflow-hidden rounded-xl p-4
            bg-gradient-to-br ${colorClasses[color]}
            border transition-all duration-300
            hover:transform hover:scale-[1.02]
        `}>
            {/* Subtle glow effect */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 bg-gradient-to-t from-transparent ${
                    color === 'gold' ? 'to-amber-500/5' :
                    color === 'blue' ? 'to-blue-500/5' :
                    'to-red-500/5'
                }`} />
            </div>

            <div className="relative z-10 text-center">
                <div className="flex justify-center mb-2 opacity-70">
                    {icon}
                </div>
                <div className={`text-xs font-medium uppercase tracking-widest ${labelColors[color]}`}>
                    {label}
                </div>
                <div className="text-white font-semibold mt-1 truncate">
                    {bossName}
                </div>
                <div className={`text-2xl font-bold ${textColors[color]} mt-1`}>
                    {isPercentage ? formatPercentage(value) : (
                        <AnimatedTimeCounter endValue={value} delay={delay} trigger={trigger} />
                    )}
                </div>
                <div className={`text-xs ${labelColors[color]} mt-1`}>
                    {difficulty}
                </div>
            </div>
        </div>
    );
};

export default function TeamLandingPage({ team, teamStats }: TeamLandingPageProps) {
    const [animationTrigger, setAnimationTrigger] = useState(false);
    const [cardsVisible, setCardsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get highlights for this team
    const highlights = getTeamHighlights(team.id);

    // Trigger animation when component mounts or becomes visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                        setAnimationTrigger(false);
                        setCardsVisible(true);
                        setTimeout(() => {
                            setAnimationTrigger(true);
                        }, 300);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: '0px'
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // Trigger immediately on mount
        setTimeout(() => {
            setCardsVisible(true);
            setTimeout(() => setAnimationTrigger(true), 300);
        }, 100);

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    const hasStats = teamStats && teamStats.totalRaidNights > 0;

    return (
        <div className="min-h-screen flex flex-col relative font-[var(--font-outfit)]" ref={containerRef}>
            {/* Background with enhanced overlay */}
            <Image
                src={`${publicBase}/backgrounds/manaforge/manaforge-broll-3.webp`}
                alt="Team Background"
                className="object-cover object-center fixed inset-0 -z-20"
                fill={true}
                priority
            />
            {/* Multi-layer overlay for depth */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
            <div className="fixed inset-0 -z-10 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
            {/* Subtle vignette */}
            <div className="fixed inset-0 -z-10" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
            }} />

            {/* Navigation */}
            <div className="fixed top-4 left-4 z-50">
                <a href={`${publicBase}/`}>
                    <button className="
                        flex items-center gap-2 text-white/80 font-medium rounded-lg text-sm px-4 py-2.5
                        bg-black/40 backdrop-blur-md border border-white/10
                        hover:bg-black/60 hover:border-white/20 hover:text-white
                        transition-all duration-300
                    ">
                        <HomeIcon />
                        <span>Home</span>
                    </button>
                </a>
            </div>

            {/* Main Content */}
            <div className="flex flex-col p-4 sm:p-6 lg:p-8 pt-20 relative z-10 flex-1">
                {/* Header */}
                <div className="text-center mb-8 lg:mb-12">
                    <h1 className="
                        font-[var(--font-cinzel)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl
                        font-bold tracking-wide
                        mythic-title
                    ">
                        {team.name}
                    </h1>
                    <MythicSeparator />
                    <p className="text-base text-white/50 tracking-widest uppercase font-light">
                        Season Dashboard
                    </p>
                </div>

                {!hasStats ? (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center">
                        <div className={`
                            mythic-card rounded-2xl p-8 sm:p-12 text-center max-w-md
                            opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                        `}>
                            <div className="mythic-corner-ornament mythic-corner-tl" />
                            <div className="mythic-corner-ornament mythic-corner-tr" />
                            <div className="mythic-corner-ornament mythic-corner-bl" />
                            <div className="mythic-corner-ornament mythic-corner-br" />

                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20">
                                    <svg className="w-8 h-8 text-purple-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h2 className="font-[var(--font-cinzel)] text-2xl font-semibold text-white/90 mb-3">
                                    Awaiting Data
                                </h2>
                                <p className="text-white/50 leading-relaxed">
                                    No raid logs have been processed for this team yet.
                                    Check back after some logs have been uploaded.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Stats Grid */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 max-w-7xl mx-auto w-full">

                        {/* Team Overview Card */}
                        <div
                            className={`
                                mythic-card rounded-2xl p-5 lg:p-6
                                opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                            `}
                            style={{ animationDelay: '0ms' }}
                        >
                            <div className="mythic-corner-ornament mythic-corner-tl" />
                            <div className="mythic-corner-ornament mythic-corner-tr" />
                            <div className="mythic-corner-ornament mythic-corner-bl" />
                            <div className="mythic-corner-ornament mythic-corner-br" />

                            <div className="relative z-10">
                                <SectionHeader>Team Overview</SectionHeader>

                                <div className="space-y-4">
                                    {/* Primary Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <StatBox
                                            icon={<CalendarIcon />}
                                            value={teamStats.totalRaidNights}
                                            label="Raid Nights"
                                            color="blue"
                                            delay={100}
                                            trigger={animationTrigger}
                                            tooltip="Only includes raid nights that were logged."
                                        />
                                        <StatBox
                                            icon={<CheckCircleIcon />}
                                            value={teamStats.totalBossKills}
                                            label="Boss Kills"
                                            color="emerald"
                                            delay={200}
                                            trigger={animationTrigger}
                                        />
                                        <StatBox
                                            icon={<ClockIcon />}
                                            value={teamStats.totalTime}
                                            label="Total Time"
                                            color="green"
                                            delay={300}
                                            trigger={animationTrigger}
                                            isTime={true}
                                            tooltip="Time from first pull to last pull of each raid night."
                                        />
                                    </div>

                                    {/* Secondary Stats Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <StatBox
                                            icon={<UsersIcon />}
                                            value={getSetSize(teamStats.uniqueCharacters)}
                                            label="Unique Players"
                                            color="purple"
                                            delay={400}
                                            trigger={animationTrigger}
                                            tooltip="Anyone who participated in any pull."
                                        />
                                        <StatBox
                                            icon={<StarIcon />}
                                            value={getSetSize(teamStats.uniqueSpecs)}
                                            label="Unique Specs"
                                            color="cyan"
                                            delay={500}
                                            trigger={animationTrigger}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Boss Progression Card */}
                        <BossProgressionCard
                            bossProgression={teamStats.bossProgression}
                            animationDelay={100}
                            cardsVisible={cardsVisible}
                            trigger={animationTrigger}
                        />

                        {/* Notable Fights Card */}
                        <div
                            className={`
                                mythic-card rounded-2xl p-5 lg:p-6
                                opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                            `}
                            style={{ animationDelay: '200ms' }}
                        >
                            <div className="mythic-corner-ornament mythic-corner-tl" />
                            <div className="mythic-corner-ornament mythic-corner-tr" />
                            <div className="mythic-corner-ornament mythic-corner-bl" />
                            <div className="mythic-corner-ornament mythic-corner-br" />

                            <div className="relative z-10">
                                <SectionHeader>Notable Fights</SectionHeader>

                                <div className="space-y-3">
                                    {teamStats.longestBossFightKill && teamStats.longestBossFightKill.name !== 'Placeholder' && (
                                        <FightCard
                                            icon={<TrophyIcon />}
                                            label="Longest Kill"
                                            bossName={teamStats.longestBossFightKill.name}
                                            value={teamStats.longestBossFightKill.duration}
                                            difficulty={teamStats.longestBossFightKill.difficulty}
                                            color="gold"
                                            delay={600}
                                            trigger={animationTrigger}
                                        />
                                    )}
                                    {teamStats.shortestBossFightKill && teamStats.shortestBossFightKill.name !== 'Placeholder' && teamStats.shortestBossFightKill.duration !== Number.MAX_VALUE && (
                                        <FightCard
                                            icon={<LightningIcon />}
                                            label="Shortest Kill"
                                            bossName={teamStats.shortestBossFightKill.name}
                                            value={teamStats.shortestBossFightKill.duration}
                                            difficulty={teamStats.shortestBossFightKill.difficulty}
                                            color="blue"
                                            delay={700}
                                            trigger={animationTrigger}
                                        />
                                    )}
                                    {teamStats.lowestWipePercentage && teamStats.lowestWipePercentage.name !== 'Placeholder' && teamStats.lowestWipePercentage.fightPercentage < 100 && (
                                        <FightCard
                                            icon={<SkullIcon />}
                                            label="Closest Wipe"
                                            bossName={teamStats.lowestWipePercentage.name}
                                            value={teamStats.lowestWipePercentage.fightPercentage}
                                            difficulty={teamStats.lowestWipePercentage.difficulty}
                                            color="red"
                                            delay={800}
                                            trigger={animationTrigger}
                                            isPercentage={true}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Links Card */}
                        <div
                            className={`
                                mythic-card mythic-card-gold rounded-2xl p-5 lg:p-6
                                opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                            `}
                            style={{ animationDelay: '300ms' }}
                        >
                            <div className="mythic-corner-ornament mythic-corner-tl" />
                            <div className="mythic-corner-ornament mythic-corner-tr" />
                            <div className="mythic-corner-ornament mythic-corner-bl" />
                            <div className="mythic-corner-ornament mythic-corner-br" />

                            <div className="relative z-10">
                                <SectionHeader>Quick Links</SectionHeader>

                                <div className="space-y-3">
                                    {/* Awards Link - Primary CTA */}
                                    <a href={`${publicBase}/teams/${team.id}/awards`} className="block group">
                                        <div className="mythic-link rounded-xl p-4 flex items-center justify-between transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
                                                    <TrophyIcon />
                                                </div>
                                                <div>
                                                    <div className="text-white font-semibold group-hover:text-amber-200 transition-colors">
                                                        Season Awards
                                                    </div>
                                                    <div className="text-sm text-white/40">
                                                        View individual player awards
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300">
                                                <ArrowRightIcon />
                                            </div>
                                        </div>
                                    </a>

                                    {/* Coming Soon Items */}
                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-white/50 font-medium">Admin Config</div>
                                                <div className="text-xs text-white/30 uppercase tracking-wider">Coming Soon</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-white/50 font-medium">Upload Logs</div>
                                                <div className="text-xs text-white/30 uppercase tracking-wider">Coming Soon</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 opacity-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                                <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div className="text-white/50 font-medium">Log Analysis</div>
                                                <div className="text-xs text-white/30 uppercase tracking-wider">Coming Soon</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Highlights Section - spans full width */}
                        <HighlightsSection
                            highlights={highlights}
                            animationDelay={400}
                            cardsVisible={cardsVisible}
                        />
                    </div>
                )}

                {/* Footer spacing */}
                <div className="h-8" />
            </div>
        </div>
    );
}
