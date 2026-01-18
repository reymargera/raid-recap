'use client';

import Link from "next/link";
import {
    TrophyIcon,
    ArrowRightIcon,
} from "@/app/_components/shared/stat-components";
import { useTeamPermissions } from "./use-team-permissions";

interface ActionBarProps {
    teamId: string;
    onAdminConfigClick: () => void;
    onUploadLogsClick: () => void;
}

export default function ActionBar({
    teamId,
    onAdminConfigClick,
    onUploadLogsClick,
}: ActionBarProps) {
    const { permissions, loading: permissionsLoading } = useTeamPermissions(teamId);

    return (
        <div className="w-full max-w-7xl mx-auto mb-6">
            {/* Glass-morphism horizontal action bar */}
            <div className="
                relative rounded-xl overflow-hidden
                bg-gradient-to-r from-amber-500/5 to-amber-600/5
                border border-amber-500/20
                backdrop-blur-xl
                p-2 lg:p-3
                hover:border-amber-500/30 transition-all duration-300
            ">
                {/* Decorative glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
                </div>

                {/* Actions Grid - responsive layout */}
                <div className="relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
                        {/* Season Awards - Primary CTA, always visible */}
                        <Link href={`/teams/${teamId}/awards`} className="group">
                            <div className="
                                mythic-link rounded-lg p-2 lg:p-3 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3
                                transition-all duration-300
                                h-full lg:h-auto
                            ">
                                <div className="
                                    w-8 h-8 lg:w-9 lg:h-9 rounded-lg
                                    bg-gradient-to-br from-amber-500/20 to-amber-600/10
                                    flex items-center justify-center
                                    border border-amber-500/20
                                    flex-shrink-0
                                ">
                                    <TrophyIcon />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-semibold text-sm lg:text-base group-hover:text-amber-200 transition-colors">
                                        Season Awards
                                    </div>
                                    <div className="text-xs text-white/40 hidden lg:block">
                                        Player awards
                                    </div>
                                </div>
                                <div className="text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                                    <ArrowRightIcon />
                                </div>
                            </div>
                        </Link>

                        {/* Admin Config - Show only if user has permission */}
                        {permissions?.canEditConfig ? (
                            <button
                                onClick={onAdminConfigClick}
                                className="group text-left"
                            >
                                <div className="
                                    mythic-link rounded-lg p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3
                                    transition-all duration-300
                                    h-full lg:h-auto
                                ">
                                    <div className="
                                        w-9 h-9 lg:w-10 lg:h-10 rounded-lg
                                        bg-gradient-to-br from-amber-500/20 to-amber-600/10
                                        flex items-center justify-center
                                        border border-amber-500/20
                                        flex-shrink-0
                                    ">
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-semibold text-sm lg:text-base group-hover:text-amber-200 transition-colors">
                                            Admin Config
                                        </div>
                                        <div className="text-xs text-white/40 hidden lg:block">
                                            Attendance settings
                                        </div>
                                    </div>
                                    <div className="text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                                        <ArrowRightIcon />
                                    </div>
                                </div>
                            </button>
                        ) : null}

                        {/* Upload Logs - Show only if user has permission */}
                        {permissions?.canUploadLogs ? (
                            <button
                                onClick={onUploadLogsClick}
                                className="group text-left"
                            >
                                <div className="
                                    mythic-link rounded-lg p-3 lg:p-4 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3
                                    transition-all duration-300
                                    h-full lg:h-auto
                                ">
                                    <div className="
                                        w-9 h-9 lg:w-10 lg:h-10 rounded-lg
                                        bg-gradient-to-br from-amber-500/20 to-amber-600/10
                                        flex items-center justify-center
                                        border border-amber-500/20
                                        flex-shrink-0
                                    ">
                                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-semibold text-sm lg:text-base group-hover:text-amber-200 transition-colors">
                                            Upload Logs
                                        </div>
                                        <div className="text-xs text-white/40 hidden lg:block">
                                            Process logs
                                        </div>
                                    </div>
                                    <div className="text-amber-400/60 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                                        <ArrowRightIcon />
                                    </div>
                                </div>
                            </button>
                        ) : null}

                        {/* Log Analysis - Coming Soon */}
                        <div className="group">
                            <div className="
                                rounded-lg p-2 lg:p-3 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3
                                bg-white/[0.02] border border-white/5
                                h-full lg:h-auto
                                opacity-50 cursor-not-allowed
                            ">
                                <div className="
                                    w-8 h-8 lg:w-9 lg:h-9 rounded-lg
                                    bg-white/5
                                    flex items-center justify-center
                                    border border-white/10
                                    flex-shrink-0
                                ">
                                    <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white/50 font-semibold text-sm lg:text-base">
                                        Log Analysis
                                    </div>
                                    <div className="text-xs text-white/30 uppercase tracking-wider">
                                        Coming Soon
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
