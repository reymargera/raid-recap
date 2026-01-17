"use client";

import Image from "next/image";
import Link from "next/link";
import { RaidTeams } from "./_config/teams";
import { publicBase } from "@/app/_config/paths";
import { useState, useEffect } from "react";

const subTitles = [
  "Confirming your suspicions that you're the only one who knows what they're doing",
  "The real BIS is the friends we made along the way",
  "We didn't wipe, we tactically retreated",
  "Loot is temporary, making numbers go up is forever",
  "Validating your belief that you carry the team",
  "Meters dont lie.. they're just heavily skewed due to attendance",
  "Where your mistakes are immortalized forever",
  "Because recounting the raid is more fun than actually raiding",
  "Aggregating data so you can fuel the next round of drama",
  "Because personal responsibility is not a trackable buff",
  "Because it wasn't 'just one pull'",
];

// Decorative separator component
const MythicSeparator = () => (
  <div className="flex items-center justify-center gap-3 my-4">
    <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
    <div className="w-2 h-2 rotate-45 bg-amber-500/60" />
    <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
  </div>
);

// Team card component
const TeamCard = ({
  team,
  index,
  cardsVisible,
}: {
  team: { id: string; name: string; logo?: string };
  index: number;
  cardsVisible: boolean;
}) => {
  return (
    <Link key={team.id} href={`/teams/${team.id}`} className="block group">
      <div
        className={`
          mythic-card rounded-2xl p-6 w-72
          opacity-0 ${cardsVisible ? "animate-fade-in-up" : ""}
          transition-all duration-300
          hover:border-amber-500/30
          group-hover:shadow-[0_0_40px_rgba(218,165,32,0.15)]
        `}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="mythic-corner-ornament mythic-corner-tl" />
        <div className="mythic-corner-ornament mythic-corner-tr" />
        <div className="mythic-corner-ornament mythic-corner-bl" />
        <div className="mythic-corner-ornament mythic-corner-br" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex-grow flex items-center justify-center mb-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <Image
                src={`${publicBase}/logos/${team.logo}`}
                alt={team.name}
                width={176}
                height={176}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
          <h2 className="font-[var(--font-cinzel)] text-lg font-semibold text-white/90 text-center tracking-wide group-hover:text-amber-200 transition-colors">
            {team.name}
          </h2>
        </div>
      </div>
    </Link>
  );
};

export default function Home() {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    // Trigger card animations on mount
    setTimeout(() => {
      setCardsVisible(true);
    }, 100);

    // Rotating subtitle effect
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSubtitleIndex(Math.floor(Math.random() * subTitles.length));
        setFade(true);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const teams = Object.values(RaidTeams);

  return (
    <div className="min-h-screen flex flex-col relative font-[var(--font-outfit)]">
      {/* Background with enhanced overlay */}
      <Image
        src={`${publicBase}/backgrounds/manaforge/manaforge-broll-7.webp`}
        alt="Background Image"
        className="object-cover object-center fixed inset-0 -z-20"
        fill={true}
        priority
      />
      {/* Multi-layer overlay for depth */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/50 via-black/70 to-black/85" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-t from-purple-950/30 via-transparent to-transparent" />
      {/* Subtle vignette */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1
            className={`
              font-[var(--font-cinzel)] text-5xl sm:text-6xl lg:text-7xl
              font-bold tracking-wide
              mythic-title
              opacity-0 ${cardsVisible ? "animate-fade-in-up" : ""}
            `}
            style={{ animationDelay: "0ms" }}
          >
            Raid Recap
          </h1>
          <MythicSeparator />
          {/* Fixed height container to prevent layout shift */}
          <div className="h-14 flex items-center justify-center">
            <p
              className={`
                text-base sm:text-lg text-white/50 max-w-2xl mx-auto px-4
                tracking-wide italic
                transition-opacity duration-500
                ${fade ? "opacity-100" : "opacity-0"}
              `}
            >
              {subTitles[subtitleIndex]}
            </p>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 max-w-7xl">
          {teams.map((team, index) => (
            <TeamCard key={team.id} team={team} index={index} cardsVisible={cardsVisible} />
          ))}
        </div>
      </div>

      {/* Footer spacing */}
      <div className="h-8" />
    </div>
  );
}
