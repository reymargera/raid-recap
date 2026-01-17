'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import Image from 'next/image';
import { getYouTubeVideoId, getYouTubeThumbnail } from '@/app/_config/highlights';
import {
  ManaforgeOmegaEncounters,
  LiberationHoldEncounters,
  NerubarPalaceEncounters,
} from '@/app/_config/encounters';

interface AddHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  onSuccess?: () => void;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error';

// Combine all encounters for the dropdown
const allEncounters = [
  { raid: 'Manaforge Omega', encounters: ManaforgeOmegaEncounters },
  { raid: 'Liberation Hold', encounters: LiberationHoldEncounters },
  { raid: "Nerub'ar Palace", encounters: NerubarPalaceEncounters },
];

// Arcane spinner component
const ArcaneSpinner = () => (
  <div className="relative w-12 h-12">
    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent animate-pulse" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(218,165,32,0.6)]" />
    </div>
  </div>
);

// Success icon
const SuccessIcon = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/10" style={{ animationDuration: '1.5s' }} />
  </div>
);

// Error icon
const ErrorIcon = () => (
  <div className="relative w-16 h-16">
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30" />
    <div className="absolute inset-0 flex items-center justify-center">
      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </div>
  </div>
);

// Close icon
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Video icon
const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export function AddHighlightModal({ isOpen, onClose, teamId, onSuccess }: AddHighlightModalProps) {
  const { data: session } = useSession();
  const [state, setState] = useState<ModalState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  // Form fields
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [encounterName, setEncounterName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  // Preview
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleRef.current && state === 'idle') {
      setTimeout(() => titleRef.current?.focus(), 200);
    }
  }, [isOpen, state]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setVideoUrl('');
        setTitle('');
        setEncounterName('');
        setDescription('');
        setDate('');
        setThumbnailPreview(null);
        setState('idle');
        setErrorMessage('');
        setIsClosing(false);
      }, 200);
    }
  }, [isOpen]);

  // Update thumbnail preview when URL changes
  useEffect(() => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      setThumbnailPreview(getYouTubeThumbnail(videoId, 'hq'));
    } else {
      setThumbnailPreview(null);
    }
  }, [videoUrl]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoUrl || !title || !encounterName) {
      setErrorMessage('Please fill in all required fields');
      setState('error');
      return;
    }

    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      setErrorMessage('Please enter a valid YouTube URL');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/teams/${teamId}/highlights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          title,
          encounterName,
          description: description || undefined,
          date: date || undefined,
        }),
      });

      const data: { success?: boolean; error?: string } = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to add highlights');
        }
        throw new Error(data.error || 'Failed to add highlight');
      }

      setState('success');
      onSuccess?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('error');
    }
  };

  const handleRetry = () => {
    setState('idle');
    setErrorMessage('');
  };

  if (!isOpen) return null;

  const isAuthenticated = !!session?.user;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        isClosing ? 'modal-backdrop-exit' : 'modal-backdrop-enter'
      }`}
      onClick={handleClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto ${
          isClosing ? 'modal-content-exit' : 'modal-content-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main card */}
        <div className="mythic-card mythic-card-gold rounded-2xl overflow-hidden">
          {/* Corner ornaments */}
          <div className="mythic-corner-ornament mythic-corner-tl" />
          <div className="mythic-corner-ornament mythic-corner-tr" />
          <div className="mythic-corner-ornament mythic-corner-bl" />
          <div className="mythic-corner-ornament mythic-corner-br" />

          {/* Header */}
          <div className="relative px-6 pt-6 pb-4">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
              aria-label="Close modal"
            >
              <CloseIcon />
            </button>

            {/* Title with arcane styling */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(218,165,32,0.15)] shrink-0">
                <VideoIcon />
              </div>
              <div>
                <h2 className="font-[var(--font-cinzel)] text-2xl font-semibold mythic-title">
                  Add Highlight
                </h2>
                <p className="text-white/50 text-sm mt-1">
                  Share a memorable moment with your team
                </p>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="mx-6 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Content */}
          <div className="px-6 py-6">
            {state === 'idle' && (
              <>
                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center border border-blue-500/30">
                      <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-white/70 mb-2">Sign in required</p>
                    <p className="text-white/40 text-sm">
                      Please sign in with Battle.net to add highlights
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label htmlFor="highlight-title" className="block text-sm font-medium text-white/70 mb-2">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={titleRef}
                        id="highlight-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., First Kill, Clean One-Shot"
                        maxLength={100}
                        className="
                          w-full px-4 py-3 rounded-xl
                          bg-black/40 text-white placeholder-white/30
                          border border-white/10
                          focus:border-amber-500/50 focus:outline-none
                          focus:ring-2 focus:ring-amber-500/20
                          transition-all duration-300
                          text-sm
                        "
                      />
                    </div>

                    {/* Encounter dropdown */}
                    <div>
                      <label htmlFor="highlight-encounter" className="block text-sm font-medium text-white/70 mb-2">
                        Boss Encounter <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="highlight-encounter"
                        value={encounterName}
                        onChange={(e) => setEncounterName(e.target.value)}
                        className="
                          w-full px-4 py-3 rounded-xl
                          bg-black/40 text-white
                          border border-white/10
                          focus:border-amber-500/50 focus:outline-none
                          focus:ring-2 focus:ring-amber-500/20
                          transition-all duration-300
                          text-sm
                          appearance-none
                          cursor-pointer
                        "
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                        }}
                      >
                        <option value="" className="bg-gray-900">Select an encounter...</option>
                        {allEncounters.map((raid) => (
                          <optgroup key={raid.raid} label={raid.raid} className="bg-gray-900">
                            {raid.encounters.map((encounter) => (
                              <option key={encounter.id} value={encounter.name} className="bg-gray-900">
                                {encounter.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* YouTube URL */}
                    <div>
                      <label htmlFor="highlight-url" className="block text-sm font-medium text-white/70 mb-2">
                        YouTube URL <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="highlight-url"
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtu.be/... or https://youtube.com/watch?v=..."
                        className="
                          w-full px-4 py-3 rounded-xl
                          bg-black/40 text-white placeholder-white/30
                          border border-white/10
                          focus:border-amber-500/50 focus:outline-none
                          focus:ring-2 focus:ring-amber-500/20
                          transition-all duration-300
                          font-mono text-sm
                        "
                      />
                      {/* Thumbnail preview */}
                      {thumbnailPreview && (
                        <div className="mt-3 relative aspect-video w-full max-w-xs rounded-lg overflow-hidden border border-white/10">
                          <Image
                            src={thumbnailPreview}
                            alt="Video thumbnail preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-amber-500/80 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description (optional) */}
                    <div>
                      <label htmlFor="highlight-description" className="block text-sm font-medium text-white/70 mb-2">
                        Description <span className="text-white/40">(optional)</span>
                      </label>
                      <textarea
                        id="highlight-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a brief description..."
                        maxLength={500}
                        rows={2}
                        className="
                          w-full px-4 py-3 rounded-xl
                          bg-black/40 text-white placeholder-white/30
                          border border-white/10
                          focus:border-amber-500/50 focus:outline-none
                          focus:ring-2 focus:ring-amber-500/20
                          transition-all duration-300
                          text-sm resize-none
                        "
                      />
                    </div>

                    {/* Date (optional) */}
                    <div>
                      <label htmlFor="highlight-date" className="block text-sm font-medium text-white/70 mb-2">
                        Date <span className="text-white/40">(optional)</span>
                      </label>
                      <input
                        id="highlight-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="
                          w-full px-4 py-3 rounded-xl
                          bg-black/40 text-white
                          border border-white/10
                          focus:border-amber-500/50 focus:outline-none
                          focus:ring-2 focus:ring-amber-500/20
                          transition-all duration-300
                          text-sm
                        "
                      />
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={!videoUrl.trim() || !title.trim() || !encounterName}
                      className="
                        w-full py-3 px-6 rounded-xl
                        font-semibold text-sm uppercase tracking-wider
                        bg-gradient-to-r from-amber-600 to-amber-500
                        text-black/90
                        border border-amber-400/50
                        hover:from-amber-500 hover:to-amber-400
                        hover:shadow-[0_0_30px_rgba(218,165,32,0.3)]
                        disabled:opacity-40 disabled:cursor-not-allowed
                        disabled:hover:shadow-none
                        transition-all duration-300
                        flex items-center justify-center gap-2
                        mt-6
                      "
                    >
                      <VideoIcon />
                      Add Highlight
                    </button>
                  </form>
                )}
              </>
            )}

            {state === 'loading' && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <ArcaneSpinner />
                </div>
                <p className="text-white/70 font-medium">Adding Highlight</p>
                <p className="text-white/40 text-sm mt-1">
                  Just a moment...
                </p>
              </div>
            )}

            {state === 'success' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <SuccessIcon />
                </div>
                <p className="text-emerald-400 font-semibold text-lg mb-1">
                  Highlight Added
                </p>
                <p className="text-white/50 text-sm mb-4">
                  Your highlight is now visible to everyone
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleClose}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-white/5 text-white/70
                      border border-white/10
                      hover:bg-white/10 hover:text-white
                      transition-all duration-200
                    "
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {state === 'error' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <ErrorIcon />
                </div>
                <p className="text-red-400 font-semibold text-lg mb-1">
                  Failed to Add Highlight
                </p>
                <p className="text-white/50 text-sm mb-4">
                  {errorMessage}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleRetry}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-gradient-to-r from-amber-600/80 to-amber-500/80
                      text-black/90
                      border border-amber-400/30
                      hover:from-amber-500 hover:to-amber-400
                      transition-all duration-200
                    "
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="
                      px-6 py-2.5 rounded-xl
                      text-sm font-medium
                      bg-white/5 text-white/70
                      border border-white/10
                      hover:bg-white/10 hover:text-white
                      transition-all duration-200
                    "
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
