'use client';

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { publicBase } from "@/app/_config/paths";
import { AuthButton, UploadLogsModal } from "@/app/_components/auth";
import { AdminConfigModal } from "./admin-config-modal";
import { useTeamPermissions } from "./use-team-permissions";
import {
    Tooltip,
    AnimatedTimeCounter,
    AnimatedNumberCounter,
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    HomeIcon
} from "@/app/_components/shared/stat-components";
import HighlightsSection from "./highlights-section";
import BossProgressionCard from "./boss-progression-card";
import TeamRosterCard, { type RosterMember } from "./team-roster-card";
import ActionBar from "./action-bar";
import { BossStats, TeamStats } from "@/warcraft-logs/model/team-stats";

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
    topDamageTakenAbilities?: Map<string, any> | { __type: string; value: [string, any][] };
    topDeathAbilities?: Map<string, any> | { __type: string; value: [string, any][] };
}

interface TeamData {
    id: string;
    name: string;
    guildId: number;
}

export interface TeamLandingPageProps {
    team: TeamData;
    teamStats: TeamStatsData | null;
    roster?: RosterMember[];
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

export default function TeamLandingPage({ team, teamStats, roster = [] }: TeamLandingPageProps) {
    const [animationTrigger, setAnimationTrigger] = useState(false);
    const [cardsVisible, setCardsVisible] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
    const [currentRoster, setCurrentRoster] = useState<RosterMember[]>(roster);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch user permissions for this team
    const { permissions, loading: permissionsLoading } = useTeamPermissions(team.id);

    // Refetch roster data when admin config changes
    const refetchRoster = async () => {
        try {
            const response = await fetch(`/api/teams/${team.id}/stats`);
            if (response.ok) {
                const data: { roster?: RosterMember[] } = await response.json();
                if (data.roster) {
                    setCurrentRoster(data.roster);
                }
            }
        } catch (err) {
            console.error('Failed to refetch roster:', err);
        }
    };

    // Sync currentRoster with roster prop when roster changes
    useEffect(() => {
        setCurrentRoster(roster);
    }, [roster]);

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
                src={`${publicBase}/backgrounds/midnight-season-1/midnight-broll-4.webp`}
                alt="Team Background"
                className="object-cover object-center absolute inset-0 -z-20"
                fill={true}
                priority
            />
            {/* Multi-layer overlay for depth */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-purple-950/20 via-transparent to-transparent" />
            {/* Subtle vignette */}
            <div className="absolute inset-0 -z-10" style={{
                background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
            }} />

            {/* Navigation */}
            <div className="fixed top-4 left-4 z-50">
                <Link href="/">
                    <button className="
                        flex items-center gap-2 text-white/80 font-medium rounded-lg text-sm px-4 py-2.5
                        bg-black/40 backdrop-blur-md border border-white/10
                        hover:bg-black/60 hover:border-white/20 hover:text-white
                        transition-all duration-300
                    ">
                        <HomeIcon />
                        <span>Home</span>
                    </button>
                </Link>
            </div>

            {/* Auth Button */}
            <div className="fixed top-4 right-4 z-50">
                <AuthButton />
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

                {/* Action Bar */}
                <div className="flex justify-center mb-8 lg:mb-10">
                    <ActionBar
                        teamId={team.id}
                        onAdminConfigClick={() => setIsAdminModalOpen(true)}
                        onUploadLogsClick={() => setIsUploadModalOpen(true)}
                    />
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
                                </div>
                            </div>
                        </div>

                        {/* Boss Progression Card */}
                        <BossProgressionCard
                            bossProgression={teamStats.bossProgression}
                            teamStats={teamStats as any}
                            animationDelay={100}
                            cardsVisible={cardsVisible}
                            trigger={animationTrigger}
                        />

                        {/* Team Roster Card - spans full width */}
                        <TeamRosterCard
                            roster={currentRoster}
                            animationDelay={300}
                            cardsVisible={cardsVisible}
                        />

                        {/* Highlights Section - spans full width */}
                        <HighlightsSection
                            teamId={team.id}
                            permissions={permissions}
                            animationDelay={400}
                            cardsVisible={cardsVisible}
                        />
                    </div>
                )}

                {/* Footer spacing */}
                <div className="h-8" />
            </div>

            {/* Upload Logs Modal */}
            <UploadLogsModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                teamId={team.id}
            />

            {/* Admin Config Modal */}
            <AdminConfigModal
                isOpen={isAdminModalOpen}
                onClose={() => setIsAdminModalOpen(false)}
                teamId={team.id}
                isAdmin={permissions?.canEditConfig ?? false}
                onSuccess={refetchRoster}
            />
        </div>
    );
}
