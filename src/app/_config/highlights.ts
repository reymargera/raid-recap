/**
 * Team Highlights Configuration
 *
 * Add your video highlights here. Each team can have multiple highlights
 * organized by boss encounter.
 *
 * Supported video formats:
 * - YouTube: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID
 * - YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
 *
 * The thumbnail will be automatically extracted from YouTube.
 */

export interface Highlight {
    /** Unique identifier for this highlight */
    id: string;
    /** The encounter/boss this highlight is for (use name from encounters.ts) */
    encounterName: string;
    /** Title displayed on the highlight card (e.g., "First Kill", "Clean One-Shot") */
    title: string;
    /** YouTube video URL */
    videoUrl: string;
    /** Optional description */
    description?: string;
    /** Optional date of the clip (ISO format: YYYY-MM-DD) */
    date?: string;
    /** Optional: Override the auto-generated thumbnail */
    thumbnailUrl?: string;
    /** User ID of the person who submitted this highlight (from database) */
    submittedBy?: string;
}

export interface TeamHighlights {
    teamId: string;
    highlights: Highlight[];
}

/**
 * Helper function to extract YouTube video ID from various URL formats
 */
export function getYouTubeVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

/**
 * Get YouTube thumbnail URL from video ID
 * Uses maxresdefault for highest quality, falls back to hqdefault
 */
export function getYouTubeThumbnail(videoId: string, quality: 'max' | 'hq' | 'mq' | 'sd' = 'hq'): string {
    const qualityMap = {
        max: 'maxresdefault',
        hq: 'hqdefault',
        mq: 'mqdefault',
        sd: 'sddefault',
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Get YouTube embed URL for iframe
 */
export function getYouTubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

// =============================================================================
// ADD YOUR TEAM HIGHLIGHTS BELOW
// =============================================================================

export const TeamHighlightsConfig: TeamHighlights[] = [
    {
        teamId: 'shadow-hunters-gold-team',
        highlights: [
            {
                id: 'gold-team-plexus-fail',
                encounterName: 'Plexus Sentinel',
                title: 'Just Following Orders',
                videoUrl: 'https://youtu.be/SimjazBA6Tw',
                date: '2025-08-21',
            },
            {
                id: 'gold-team-loomithar-first-kill',
                encounterName: 'Loom\'ithar',
                title: 'Loomithar Down',
                videoUrl: 'https://youtu.be/XlV0ZTovj8k',
                description: 'Gold Team\'s First Loomithar Kill',
                date: '2025-09-25',
            },
            {
                id: 'gold-team-loomithar-lock-in',
                encounterName: 'Loom\'ithar',
                title: 'Everyone Lock In',
                videoUrl: 'https://youtu.be/ITs0BWyWBY4',
                date: '2025-09-23',
            },
            {
                id: 'gold-team-forgeweaver-first-kill',
                encounterName: 'Forgeweaver Araz',
                title: 'Forgeweaver Down',
                videoUrl: 'https://youtu.be/pFN1g4EZxCk',
                date: '2025-10-21',
            },
            {
                id: 'gold-team-soul-hunters-first-kill',
                encounterName: 'The Soul Hunters',
                title: 'Soul Hunters Down',
                videoUrl: 'https://youtu.be/qJTq2TfBqJ0',
                date: '2025-11-15',
            },
            {
                id: 'gold-team-fractilus-rekt',
                encounterName: 'Fractillus',
                title: 'Just a Little Fiasco',
                videoUrl: 'https://youtu.be/c5XmfohPiO0',
                date: '2025-08-21',
            }
        ],
    },
    {
        teamId: 'shadow-hunters-blue-team',
        highlights: [],
    },
    {
        teamId: 'shadow-hunters-green-team',
        highlights: [],
    },
    {
        teamId: 'shadow-hunters-pink-team',
        highlights: [],
    },
];

/**
 * Get highlights for a specific team
 */
export function getTeamHighlights(teamId: string): Highlight[] {
    const teamConfig = TeamHighlightsConfig.find(t => t.teamId === teamId);
    return teamConfig?.highlights ?? [];
}

/**
 * Get highlights grouped by encounter for a specific team
 */
export function getHighlightsByEncounter(teamId: string): Map<string, Highlight[]> {
    const highlights = getTeamHighlights(teamId);
    const grouped = new Map<string, Highlight[]>();

    for (const highlight of highlights) {
        const existing = grouped.get(highlight.encounterName) ?? [];
        existing.push(highlight);
        grouped.set(highlight.encounterName, existing);
    }

    return grouped;
}
