'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import {
    Highlight,
    getYouTubeVideoId,
    getYouTubeThumbnail,
    getYouTubeEmbedUrl,
} from '@/app/_config/highlights';
import {
    VoidspireEncounters,
    DreamriftEncounters,
    MarchOnQuelDanasEncounters,
    SporefallEncounters,
    ManaforgeOmegaEncounters,
    NerubarPalaceEncounters,
    LiberationHoldEncounters
} from '@/app/_config/encounters';
import { AddHighlightModal } from './add-highlight-modal';
import { TeamPermissions } from './use-team-permissions';

// Create encounter order lookup for sorting
const createEncounterOrderMap = (): Map<string, number> => {
  const orderMap = new Map<string, number>();

  // Midnight Season 1 tier (most recent, 4 concurrent raids) = priority 0-9
  VoidspireEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx);
  });
  DreamriftEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 6);
  });
  MarchOnQuelDanasEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 7);
  });
  SporefallEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 9);
  });
  // Manaforge = priority 100-107
  ManaforgeOmegaEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 100);
  });
  // Liberation Hold = priority 200-207
  LiberationHoldEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 200);
  });
  // Nerub-ar Palace = priority 300-307
  NerubarPalaceEncounters.forEach((enc, idx) => {
    orderMap.set(enc.name, idx + 300);
  });

  return orderMap;
};

const ENCOUNTER_ORDER = createEncounterOrderMap();

interface HighlightsSectionProps {
    teamId: string;
    permissions: TeamPermissions | null;
    animationDelay?: number;
    cardsVisible?: boolean;
}

// Extended highlight with submittedBy from the database
interface HighlightWithSubmitter extends Highlight {
    submittedBy?: string;
}

// Video modal component
const VideoModal = ({
    highlight,
    onClose,
}: {
    highlight: Highlight;
    onClose: () => void;
}) => {
    const videoId = getYouTubeVideoId(highlight.videoUrl);

    if (!videoId) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Video container */}
            <div
                className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <iframe
                    src={getYouTubeEmbedUrl(videoId)}
                    title={highlight.title}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>

            {/* Title and description */}
            <div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center max-w-2xl px-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-xl font-semibold text-white mb-1">
                    {highlight.title}
                </h3>
                <p className="text-white/60 text-sm">
                    {highlight.encounterName}
                    {highlight.date && ` • ${new Date(highlight.date).toLocaleDateString()}`}
                </p>
                {highlight.description && (
                    <p className="text-white/50 text-sm mt-2">{highlight.description}</p>
                )}
            </div>
        </div>
    );
};

// Highlight card component
const HighlightCard = ({
    highlight,
    onClick,
    onDelete,
    canDelete,
}: {
    highlight: Highlight;
    onClick: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
}) => {
    const videoId = getYouTubeVideoId(highlight.videoUrl);
    const thumbnailUrl = highlight.thumbnailUrl ||
        (videoId ? getYouTubeThumbnail(videoId, 'hq') : null);

    return (
        <div className="relative group">
            <button
                onClick={onClick}
                className="w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10"
            >
                {/* Thumbnail */}
                {thumbnailUrl && (
                    <Image
                        src={thumbnailUrl}
                        alt={highlight.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized
                    />
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/90 flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-400">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </div>

                {/* Info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-xs text-amber-300/80 uppercase tracking-wider mb-1">
                        {highlight.encounterName}
                    </div>
                    <div className="text-white font-semibold">
                        {highlight.title}
                    </div>
                    {highlight.date && (
                        <div className="text-white/50 text-xs mt-1">
                            {new Date(highlight.date).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
                </div>
            </button>

            {/* Delete button - top right corner, visible on hover */}
            {canDelete && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="
                        absolute top-2 right-2 z-10
                        w-8 h-8 rounded-full
                        bg-red-500/80 hover:bg-red-500
                        flex items-center justify-center
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-200
                        text-white
                    "
                    title="Delete highlight"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default function HighlightsSection({
    teamId,
    permissions,
    animationDelay = 400,
    cardsVisible = false,
}: HighlightsSectionProps) {
    const { data: session } = useSession();
    const [highlights, setHighlights] = useState<HighlightWithSubmitter[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const isAuthenticated = !!session?.user;
    const userId = session?.user?.id;

    // Fetch highlights from API
    const fetchHighlights = async () => {
        try {
            const response = await fetch(`/api/teams/${teamId}/highlights`);
            const data: { highlights?: HighlightWithSubmitter[] } = await response.json();
            setHighlights(data.highlights || []);
        } catch (err) {
            console.error('Failed to fetch highlights:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHighlights();
    }, [teamId]);

    const handleDelete = async (highlightId: string) => {
        if (!confirm('Are you sure you want to delete this highlight?')) return;

        try {
            const response = await fetch(`/api/teams/${teamId}/highlights/${highlightId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchHighlights();
            } else {
                const data: { error?: string } = await response.json();
                alert(data.error || 'Failed to delete highlight');
            }
        } catch (err) {
            console.error('Failed to delete highlight:', err);
            alert('Failed to delete highlight');
        }
    };

    const canDeleteHighlight = (highlight: HighlightWithSubmitter) => {
        if (!isAuthenticated || !userId) return false;
        // User can delete if they are the submitter or have admin permissions
        return highlight.submittedBy === userId || permissions?.canDeleteAnyHighlight;
    };

    // Group highlights by encounter (existing logic)
    const groupedHighlights = highlights.reduce((acc, highlight) => {
        const key = highlight.encounterName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(highlight);
        return acc;
    }, {} as Record<string, HighlightWithSubmitter[]>);

    // Sort within each encounter group by date (newest first)
    Object.keys(groupedHighlights).forEach(encounterName => {
        groupedHighlights[encounterName].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    });

    // Create sorted entries array for rendering
    const sortedEncounterEntries = Object.entries(groupedHighlights).sort(([nameA], [nameB]) => {
        const orderA = ENCOUNTER_ORDER.get(nameA) ?? 999;
        const orderB = ENCOUNTER_ORDER.get(nameB) ?? 999;
        return orderA - orderB;
    });

    // Show section even if no highlights (so users can add them)
    const hasHighlights = highlights.length > 0;

    return (
        <>
            {/* Highlights Card */}
            <div
                className={`
                    mythic-card rounded-2xl p-5 lg:p-6 lg:col-span-2
                    opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
                `}
                style={{ animationDelay: `${animationDelay}ms` }}
            >
                <div className="mythic-corner-ornament mythic-corner-tl" />
                <div className="mythic-corner-ornament mythic-corner-tr" />
                <div className="mythic-corner-ornament mythic-corner-bl" />
                <div className="mythic-corner-ornament mythic-corner-br" />

                <div className="relative z-10">
                    {/* Section Header */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="font-[var(--font-cinzel)] text-xl font-semibold text-white/90 tracking-wide">
                                    Highlights
                                </h2>
                            </div>

                            {/* Add Highlight button - visible to all, disabled for non-authenticated */}
                            <div className="relative group">
                                <button
                                    onClick={() => isAuthenticated && setIsAddModalOpen(true)}
                                    disabled={!isAuthenticated}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg
                                        text-sm font-medium
                                        transition-all duration-200
                                        ${isAuthenticated
                                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
                                            : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add
                                </button>

                                {/* Tooltip for non-authenticated users */}
                                {!isAuthenticated && (
                                    <div className="
                                        absolute right-0 top-full mt-2 z-20
                                        px-3 py-2 rounded-lg
                                        bg-gray-900 text-white/70 text-xs
                                        border border-white/10
                                        opacity-0 group-hover:opacity-100
                                        transition-opacity duration-200
                                        pointer-events-none
                                        whitespace-nowrap
                                        shadow-xl
                                    ">
                                        Sign in to add highlights
                                        <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 border-l border-t border-white/10 transform rotate-45" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="relative w-10 h-10">
                                <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
                                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
                            </div>
                        </div>
                    ) : !hasHighlights ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-white/50 mb-2">No highlights yet</p>
                            <p className="text-white/30 text-sm">
                                {isAuthenticated
                                    ? 'Be the first to share a memorable moment!'
                                    : 'Sign in to add the first highlight!'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedEncounterEntries.map(([encounterName, encounterHighlights]) => (
                                <div key={encounterName}>
                                    <h3 className="text-sm text-white/50 uppercase tracking-wider mb-3">
                                        {encounterName}
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {encounterHighlights.map((highlight) => (
                                            <HighlightCard
                                                key={highlight.id}
                                                highlight={highlight}
                                                onClick={() => setSelectedHighlight(highlight)}
                                                onDelete={() => handleDelete(highlight.id)}
                                                canDelete={canDeleteHighlight(highlight)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Video Modal */}
            {selectedHighlight && (
                <VideoModal
                    highlight={selectedHighlight}
                    onClose={() => setSelectedHighlight(null)}
                />
            )}

            {/* Add Highlight Modal */}
            <AddHighlightModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                teamId={teamId}
                onSuccess={fetchHighlights}
            />
        </>
    );
}
