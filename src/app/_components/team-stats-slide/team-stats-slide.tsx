'use client';

import { SwiperSlide } from "swiper/react";
import { TeamStats } from "@/warcraft-logs/model/team-stats";
import { publicBase } from "@/app/_config/paths";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

// Tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 w-64 text-center">
                    <div>{content}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
            )}
        </div>
    );
};

export interface TeamStatsSlideProps {
    teamStats: TeamStats;
    teamName: string;
}

// Icon components for better visual hierarchy
const CalendarIcon = () => (
    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const SwordIcon = () => (
    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const TargetIcon = () => (
    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.25 15.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const UsersIcon = () => (
    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const BookIcon = () => (
    <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

const LightningIcon = () => (
    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const SkullIcon = () => (
    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM9 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm6 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-3 2.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `<1m`;
    }
}

function formatPercentage(percentage: number): string {
    return `${percentage.toFixed(1)}%`;
}

// Animated counter hook with trigger support
function useAnimatedCounter(endValue: number, duration: number = 2000, delay: number = 0, trigger: boolean = true) {
    const [currentValue, setCurrentValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!trigger) return;

        // Reset to 0 when trigger changes
        setCurrentValue(0);

        const timer = setTimeout(() => {
            setIsAnimating(true);
            let startTime: number | null = null;
            const startValue = 0;

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / duration, 1);

                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const newValue = Math.round(startValue + (endValue - startValue) * easeOutQuart);

                setCurrentValue(newValue);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    setIsAnimating(false);
                }
            };

            requestAnimationFrame(animate);
        }, delay);

        return () => clearTimeout(timer);
    }, [endValue, duration, delay, trigger]);

    return currentValue;
}

// Animated time counter component
function AnimatedTimeCounter({ endValue, delay = 0, trigger = true }: { endValue: number; delay?: number; trigger?: boolean }) {
    const animatedValue = useAnimatedCounter(endValue, 2000, delay, trigger);
    return <span>{formatTime(animatedValue)}</span>;
}

// Animated number counter component
function AnimatedNumberCounter({ endValue, delay = 0, trigger = true }: { endValue: number; delay?: number; trigger?: boolean }) {
    const animatedValue = useAnimatedCounter(endValue, 2000, delay, trigger);
    return <span>{animatedValue}</span>;
}

// DPS Meter-style bar component
function DPSMeterBar({
    ability,
    value,
    maxValue,
    index,
    trigger = true,
    isDeathCount = false
}: {
    ability: string;
    value: number;
    maxValue: number;
    index: number;
    trigger?: boolean;
    isDeathCount?: boolean;
}) {
    const [animatedWidth, setAnimatedWidth] = useState(0);
    const percentage = (value / maxValue) * 100;

    useEffect(() => {
        if (!trigger) return;

        setAnimatedWidth(0);
        const timer = setTimeout(() => {
            const startTime = Date.now();
            const duration = 1500;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);

                setAnimatedWidth(percentage * easeOutQuart);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        }, index * 200); // Stagger animation

        return () => clearTimeout(timer);
    }, [percentage, index, trigger]);

    const formatValue = (val: number) => {
        if (isDeathCount) return val.toString();
        return val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}K`;
    };

    return (
        <div className="relative mb-1">
            <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                        isDeathCount
                            ? 'bg-gradient-to-r from-red-600 to-red-700'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700'
                    }`}
                    style={{ width: `${animatedWidth}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                    <span className="text-white font-medium truncate drop-shadow-lg">
                        {index + 1}. {ability}
                    </span>
                    <span className="text-white font-mono font-bold drop-shadow-lg">
                        {formatValue(value)}
                    </span>
                </div>
            </div>
        </div>
    );
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
                    src={`${publicBase}/backgrounds/undermine/undermine-broll-1.webp`}
                    alt="Team Stats Background"
                    className="slide-background object-cover object-center"
                    fill={true}
                />
                <div className="flex flex-col p-4 relative z-10 flex-1">
                    <div className="award-heading mb-2">
                        <h1 className="text-3xl font-extrabold leading-none tracking-tight md:text-4xl lg:text-5xl text-white text-center">
                            Season Overview
                        </h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto flex-1">
                        {/* Raid Summary */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Raid Summary
                            </h2>
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
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Notable Fights
                            </h2>
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
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Team Composition
                            </h2>
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
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Damage Report
                            </h2>
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
