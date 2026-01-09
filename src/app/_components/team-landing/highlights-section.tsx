'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
    Highlight,
    getYouTubeVideoId,
    getYouTubeThumbnail,
    getYouTubeEmbedUrl,
} from '@/app/_config/highlights';

interface HighlightsSectionProps {
    highlights: Highlight[];
    animationDelay?: number;
    cardsVisible?: boolean;
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
}: {
    highlight: Highlight;
    onClick: () => void;
}) => {
    const videoId = getYouTubeVideoId(highlight.videoUrl);
    const thumbnailUrl = highlight.thumbnailUrl ||
        (videoId ? getYouTubeThumbnail(videoId, 'hq') : null);

    return (
        <button
            onClick={onClick}
            className="group relative w-full aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10"
        >
            {/* Thumbnail */}
            {thumbnailUrl && (
                <Image
                    src={thumbnailUrl}
                    alt={highlight.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized // YouTube thumbnails don't need Next.js optimization
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
    );
};

export default function HighlightsSection({
    highlights,
    animationDelay = 400,
    cardsVisible = false,
}: HighlightsSectionProps) {
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);

    // Don't render if no highlights
    if (highlights.length === 0) {
        return null;
    }

    // Group highlights by encounter
    const groupedHighlights = highlights.reduce((acc, highlight) => {
        const key = highlight.encounterName;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(highlight);
        return acc;
    }, {} as Record<string, Highlight[]>);

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
                        <div className="mt-3 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
                    </div>

                    {/* Highlights by encounter */}
                    <div className="space-y-6">
                        {Object.entries(groupedHighlights).map(([encounterName, encounterHighlights]) => (
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
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Video Modal */}
            {selectedHighlight && (
                <VideoModal
                    highlight={selectedHighlight}
                    onClose={() => setSelectedHighlight(null)}
                />
            )}
        </>
    );
}
