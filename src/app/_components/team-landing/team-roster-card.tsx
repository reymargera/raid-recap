'use client';

import { useState, useMemo } from 'react';
import { getCharacterAvatarUrl } from '@/app/_utils/blizzard-renders';

// WoW class colors - matching existing patterns
const classColors: Record<string, string> = {
  'DeathKnight': 'text-[#C41E3A]',
  'DemonHunter': 'text-[#A330C9]',
  'Druid': 'text-[#FF7C0A]',
  'Evoker': 'text-[#33937F]',
  'Hunter': 'text-[#AAD372]',
  'Mage': 'text-[#3FC7EB]',
  'Monk': 'text-[#00FF98]',
  'Paladin': 'text-[#F48CBA]',
  'Priest': 'text-white',
  'Rogue': 'text-[#FFF468]',
  'Shaman': 'text-[#0070DD]',
  'Warlock': 'text-[#8788EE]',
  'Warrior': 'text-[#C69B6D]',
};

// Class border glow colors for avatars
const classBorderColors: Record<string, string> = {
  'DeathKnight': 'border-[#C41E3A]/40 hover:border-[#C41E3A]/70 hover:shadow-[0_0_12px_rgba(196,30,58,0.3)]',
  'DemonHunter': 'border-[#A330C9]/40 hover:border-[#A330C9]/70 hover:shadow-[0_0_12px_rgba(163,48,201,0.3)]',
  'Druid': 'border-[#FF7C0A]/40 hover:border-[#FF7C0A]/70 hover:shadow-[0_0_12px_rgba(255,124,10,0.3)]',
  'Evoker': 'border-[#33937F]/40 hover:border-[#33937F]/70 hover:shadow-[0_0_12px_rgba(51,147,127,0.3)]',
  'Hunter': 'border-[#AAD372]/40 hover:border-[#AAD372]/70 hover:shadow-[0_0_12px_rgba(170,211,114,0.3)]',
  'Mage': 'border-[#3FC7EB]/40 hover:border-[#3FC7EB]/70 hover:shadow-[0_0_12px_rgba(63,199,235,0.3)]',
  'Monk': 'border-[#00FF98]/40 hover:border-[#00FF98]/70 hover:shadow-[0_0_12px_rgba(0,255,152,0.3)]',
  'Paladin': 'border-[#F48CBA]/40 hover:border-[#F48CBA]/70 hover:shadow-[0_0_12px_rgba(244,140,186,0.3)]',
  'Priest': 'border-white/40 hover:border-white/70 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)]',
  'Rogue': 'border-[#FFF468]/40 hover:border-[#FFF468]/70 hover:shadow-[0_0_12px_rgba(255,244,104,0.3)]',
  'Shaman': 'border-[#0070DD]/40 hover:border-[#0070DD]/70 hover:shadow-[0_0_12px_rgba(0,112,221,0.3)]',
  'Warlock': 'border-[#8788EE]/40 hover:border-[#8788EE]/70 hover:shadow-[0_0_12px_rgba(135,136,238,0.3)]',
  'Warrior': 'border-[#C69B6D]/40 hover:border-[#C69B6D]/70 hover:shadow-[0_0_12px_rgba(198,155,109,0.3)]',
};

export interface RosterMember {
  playerId: number;
  playerName: string;
  server: string;
  playerClass: string;
}

interface TeamRosterCardProps {
  roster: RosterMember[];
  animationDelay: number;
  cardsVisible: boolean;
}

// Card section header - matching existing pattern
const SectionHeader = ({ children, count }: { children: React.ReactNode; count?: number }) => (
  <div className="mb-5">
    <div className="flex items-center justify-between">
      <h2 className="font-[var(--font-cinzel)] text-xl font-semibold text-white/90 tracking-wide">
        {children}
      </h2>
      {count !== undefined && (
        <span className="text-sm text-purple-400/80 font-medium">
          {count} {count === 1 ? 'Raider' : 'Raiders'}
        </span>
      )}
    </div>
    <div className="mt-2 h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
  </div>
);

// Individual character avatar component
const CharacterAvatar = ({
  member,
  index,
  cardsVisible,
}: {
  member: RosterMember;
  index: number;
  cardsVisible: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = getCharacterAvatarUrl(member.playerId, member.server);

  // Stagger animation delay based on index
  const staggerDelay = Math.min(index * 30, 600); // Cap at 600ms total stagger

  return (
    <div
      className={`
        group flex flex-col items-center gap-1.5
        opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
      `}
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      {/* Avatar container with class-colored glow */}
      <div
        className={`
          relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden
          border-2 transition-all duration-300 cursor-default
          bg-gradient-to-br from-black/60 to-black/40
          ${classBorderColors[member.playerClass] || 'border-white/30 hover:border-white/50'}
        `}
      >
        {/* Avatar image */}
        {!imageError ? (
          <img
            src={avatarUrl}
            alt={member.playerName}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          // Fallback: Class-colored placeholder with initial
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-purple-950/80">
            <span className={`text-lg font-bold ${classColors[member.playerClass] || 'text-white'}`}>
              {member.playerName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Subtle inner glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Character name */}
      <span
        className={`
          text-xs font-medium truncate max-w-[60px] sm:max-w-[70px]
          transition-all duration-200
          ${classColors[member.playerClass] || 'text-white'}
          group-hover:drop-shadow-[0_0_8px_currentColor]
        `}
        title={`${member.playerName} - ${member.server}`}
      >
        {member.playerName}
      </span>
    </div>
  );
};

// Users icon for empty state
const UsersIcon = () => (
  <svg className="w-8 h-8 text-purple-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export default function TeamRosterCard({
  roster,
  animationDelay,
  cardsVisible,
}: TeamRosterCardProps) {
  // Sort roster by class for visual grouping (optional, can be removed)
  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => a.playerClass.localeCompare(b.playerClass));
  }, [roster]);

  if (roster.length === 0) {
    return null; // Don't render if no roster data
  }

  return (
    <div
      className={`
        mythic-card rounded-2xl p-5 lg:p-6
        lg:col-span-2
        opacity-0 ${cardsVisible ? 'animate-fade-in-up' : ''}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Corner ornaments */}
      <div className="mythic-corner-ornament mythic-corner-tl" />
      <div className="mythic-corner-ornament mythic-corner-tr" />
      <div className="mythic-corner-ornament mythic-corner-bl" />
      <div className="mythic-corner-ornament mythic-corner-br" />

      <div className="relative z-10">
        <SectionHeader count={roster.length}>Team Roster</SectionHeader>

        {sortedRoster.length > 0 ? (
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 sm:gap-4">
            {sortedRoster.map((member, index) => (
              <CharacterAvatar
                key={member.playerId}
                member={member}
                index={index}
                cardsVisible={cardsVisible}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center border border-purple-500/20 mb-4">
              <UsersIcon />
            </div>
            <p className="text-white/50 text-sm">
              No roster data available yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
