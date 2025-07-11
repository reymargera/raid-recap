'use client';

import { SwiperSlide } from "swiper/react";
import { TeamStats } from "@/warcraft-logs/model/team-stats";
import { publicBase } from "@/app/_config/paths";
import Image from "next/image";

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

export default function TeamStatsSlide({ teamStats, teamName }: TeamStatsSlideProps) {
    const topDamageTaken = teamStats.getTopDamageTakenAbilities(5);
    const topDeathAbilities = teamStats.getTopDeathAbilities(5);

    return (
        <div className="team-inforgraphic-container">
            <div className="min-h-screen justify-center items-center relative">
                <Image
                    src={`${publicBase}/backgrounds/nerubar-broll-1.jpg`}
                    alt="Team Stats Background"
                    className="slide-background object-cover object-center"
                    fill={true}
                />
                <div className="flex flex-col p-8 min-h-screen justify-center content-center relative z-10">
                    <div className="award-heading mb-8">
                        <h1 className="text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-white p-2 text-center">
                            {teamName} Season Overview
                        </h1>
                        <p className="mb-6 text-lg font-normal text-white-400 lg:text-xl text-center">
                            A comprehensive look at the team's performance this season
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                        {/* Raid Summary */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Raid Summary
                            </h2>
                            <div className={`grid gap-6 ${teamStats.totalFailedResets > 0 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                                <div className="text-center bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <CalendarIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-blue-400 mb-2">{teamStats.totalRaidNights}</div>
                                    <div className="text-sm text-blue-200 font-medium uppercase tracking-wide">Raid Nights</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <ClockIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-green-400 mb-2">{formatTime(teamStats.totalTime)}</div>
                                    <div className="text-sm text-green-200 font-medium uppercase tracking-wide">Total Time</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-6 rounded-xl border border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <SwordIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-yellow-400 mb-2">{formatTime(teamStats.timeSpentPullingBosses)}</div>
                                    <div className="text-sm text-yellow-200 font-medium uppercase tracking-wide">Boss Pull Time</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <TargetIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-purple-400 mb-2">{teamStats.totalPulls}</div>
                                    <div className="text-sm text-purple-200 font-medium uppercase tracking-wide">Total Pulls</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-red-500/20 to-red-600/20 p-6 rounded-xl border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <RefreshIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-red-400 mb-2">{teamStats.totalResets}</div>
                                    <div className="text-sm text-red-200 font-medium uppercase tracking-wide">Resets</div>
                                </div>
                                {teamStats.totalFailedResets > 0 && (
                                    <div className="text-center bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 rounded-xl border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
                                        <div className="flex justify-center mb-3">
                                            <AlertIcon />
                                        </div>
                                        <div className="text-5xl font-extrabold text-orange-400 mb-2">{teamStats.totalFailedResets}</div>
                                        <div className="text-sm text-orange-200 font-medium uppercase tracking-wide">Failed Resets</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notable Fights */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Notable Fights
                            </h2>
                            <div className="space-y-4">
                                {teamStats.longestBossFightKill.name !== 'Placeholder' && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <div className="text-sm text-white-400">Longest Kill</div>
                                        <div className="text-white font-semibold">{teamStats.longestBossFightKill.name}</div>
                                        <div className="text-sm text-green-400">
                                            {formatTime(teamStats.longestBossFightKill.duration)} • {teamStats.longestBossFightKill.difficulty}
                                        </div>
                                    </div>
                                )}
                                {teamStats.shortestBossFightKill.name !== 'Placeholder' && teamStats.shortestBossFightKill.duration !== Number.MAX_VALUE && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <div className="text-sm text-white-400">Shortest Kill</div>
                                        <div className="text-white font-semibold">{teamStats.shortestBossFightKill.name}</div>
                                        <div className="text-sm text-blue-400">
                                            {formatTime(teamStats.shortestBossFightKill.duration)} • {teamStats.shortestBossFightKill.difficulty}
                                        </div>
                                    </div>
                                )}
                                {teamStats.lowestWipePercentage.name !== 'Placeholder' && teamStats.lowestWipePercentage.fightPercentage < 100 && (
                                    <div className="bg-white/10 rounded-lg p-3">
                                        <div className="text-sm text-white-400">Closest Wipe</div>
                                        <div className="text-white font-semibold">{teamStats.lowestWipePercentage.name}</div>
                                        <div className="text-sm text-orange-400">
                                            {formatPercentage(teamStats.lowestWipePercentage.fightPercentage)} • {teamStats.lowestWipePercentage.difficulty}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Composition */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Team Composition
                            </h2>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <UsersIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-purple-400 mb-2">{teamStats.uniqueCharacters.size}</div>
                                    <div className="text-sm text-purple-200 font-medium uppercase tracking-wide">Unique Players</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-6 rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <StarIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-cyan-400 mb-2">{teamStats.uniqueSpecs.size}</div>
                                    <div className="text-sm text-cyan-200 font-medium uppercase tracking-wide">Unique Specs</div>
                                </div>
                                <div className="text-center bg-gradient-to-br from-pink-500/20 to-pink-600/20 p-6 rounded-xl border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300">
                                    <div className="flex justify-center mb-3">
                                        <BookIcon />
                                    </div>
                                    <div className="text-5xl font-extrabold text-pink-400 mb-2">{teamStats.uniqueTalentLoadouts.size}</div>
                                    <div className="text-sm text-pink-200 font-medium uppercase tracking-wide">Talent Builds</div>
                                </div>
                            </div>
                        </div>

                        {/* Most Dangerous Abilities */}
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-4">
                                Most Dangerous
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-white-400 mb-2">Top Damage Sources</div>
                                    {topDamageTaken.slice(0, 3).map((ability, index) => (
                                        <div key={`damage-${ability.guid}`} className="flex justify-between items-center text-sm">
                                            <span className="text-white truncate">{index + 1}. {ability.name}</span>
                                            <span className="text-red-400 font-mono">{(ability.total / 1000000).toFixed(1)}M</span>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <div className="text-sm text-white-400 mb-2">Top Death Causes</div>
                                    {topDeathAbilities.slice(0, 3).map((ability, index) => (
                                        <div key={`death-${ability.guid}`} className="flex justify-between items-center text-sm">
                                            <span className="text-white truncate">{index + 1}. {ability.name}</span>
                                            <span className="text-orange-400 font-mono">{ability.count}</span>
                                        </div>
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
