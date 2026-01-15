'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';

interface UploadLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Parses a Warcraft Logs URL or report code and extracts the report code
 * Supports formats:
 * - https://www.warcraftlogs.com/reports/ABC123XYZ
 * - https://www.warcraftlogs.com/reports/ABC123XYZ#fight=1
 * - warcraftlogs.com/reports/ABC123XYZ
 * - ABC123XYZ (raw code)
 */
function parseReportCode(input: string): string | null {
  const trimmed = input.trim();

  // Try to extract from URL
  const urlPattern = /(?:https?:\/\/)?(?:www\.)?warcraftlogs\.com\/reports\/([a-zA-Z0-9]+)/i;
  const urlMatch = trimmed.match(urlPattern);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Check if it's a raw report code (alphanumeric only)
  const codePattern = /^[a-zA-Z0-9]+$/;
  if (codePattern.test(trimmed) && trimmed.length >= 8 && trimmed.length <= 32) {
    return trimmed;
  }

  return null;
}

// Arcane spinner component
const ArcaneSpinner = () => (
  <div className="relative w-12 h-12">
    {/* Outer ring */}
    <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
    {/* Spinning ring */}
    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
    {/* Inner glow */}
    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent animate-pulse" />
    {/* Center dot */}
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

// Upload icon
const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export function UploadLogsModal({ isOpen, onClose, teamId }: UploadLogsModalProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const [state, setState] = useState<ModalState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current && state === 'idle') {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, state]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setInput('');
        setState('idle');
        setErrorMessage('');
        setWorkflowId(null);
        setIsClosing(false);
      }, 200);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reportCode = parseReportCode(input);

    if (!reportCode) {
      setErrorMessage('Please enter a valid Warcraft Logs URL or report code');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/reports/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId,
          reportCode,
          season: 'season-3',
        }),
      });

      const data: { workflowId?: string; error?: string } = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Only authorized team admins can upload logs');
        }
        throw new Error(data.error || 'Failed to process report');
      }

      setWorkflowId(data.workflowId ?? null);
      setState('success');
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
        className={`relative w-full max-w-lg ${
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
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(218,165,32,0.15)]">
                <UploadIcon />
              </div>
              <h2 className="font-[var(--font-cinzel)] text-2xl font-semibold mythic-title">
                Upload Logs
              </h2>
            </div>
            <p className="text-white/50 text-sm mt-2 ml-[52px]">
              Process a Warcraft Logs report for this team
            </p>
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
                      Please sign in with Battle.net to upload logs
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input field */}
                    <div>
                      <label htmlFor="report-input" className="block text-sm font-medium text-white/70 mb-2">
                        Warcraft Logs URL or Report Code
                      </label>
                      <div className="relative group">
                        <input
                          ref={inputRef}
                          id="report-input"
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="https://www.warcraftlogs.com/reports/... or ABC123XYZ"
                          className="
                            w-full px-4 py-3 rounded-xl
                            bg-black/40 text-white placeholder-white/30
                            border border-white/10
                            focus:border-amber-500/50 focus:outline-none
                            focus:ring-2 focus:ring-amber-500/20
                            focus:shadow-[0_0_20px_rgba(218,165,32,0.15)]
                            transition-all duration-300
                            font-mono text-sm
                          "
                        />
                        {/* Glow effect on focus */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      <p className="mt-2 text-xs text-white/40">
                        Paste a full URL or just the report code (e.g., ABC123XYZ)
                      </p>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={!input.trim()}
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
                      "
                    >
                      <UploadIcon />
                      Process Report
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
                <p className="text-white/70 font-medium">Processing Report</p>
                <p className="text-white/40 text-sm mt-1">
                  This may take a moment...
                </p>
              </div>
            )}

            {state === 'success' && (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <SuccessIcon />
                </div>
                <p className="text-emerald-400 font-semibold text-lg mb-1">
                  Report Queued Successfully
                </p>
                <p className="text-white/50 text-sm mb-4">
                  Your report is being processed in the background
                </p>
                {workflowId && (
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-xs text-white/40">Workflow ID: </span>
                    <span className="text-xs text-white/70 font-mono">{workflowId}</span>
                  </div>
                )}
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
                  Processing Failed
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
