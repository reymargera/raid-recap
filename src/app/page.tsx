"use client";

import Image from "next/image";
import { RaidTeams } from "./_config/teams";
import {publicBase} from "@/app/_config/paths";
import { useState, useEffect } from "react";

const subTitles = [
  "Confirming your suspicions that you're the only one who knows what they're doing",
  "The real BIS is the friends we made along the way",
  "We didn't wipe, we tactically retreated",
  "Loot is temporary, making numbers go up is forever",
  "Validating your belief that you carry the team",
  "Meters dont lie.. they're just heavily skewed due to attendance",
  "Where your mistakes are immortalized forever",
  "Because recouting the raid is more fun than actually raiding",
  "Aggregating data so you can fuel the next round of drama",
  "Because personal responsibility is not a trackable buff",
  "Because it wassn't 'just one pull'",
];


export default function Home() {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSubtitleIndex(Math.floor(Math.random() * subTitles.length));
        setFade(true);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, [subtitleIndex]);

  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-screen text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={`${publicBase}/backgrounds/threads-of-destiny.png`}
          alt="Background Image"
          className="object-cover object-center w-full h-full"
          fill={true}
        />
        <div className="absolute inset-0 bg-black opacity-70"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
        <h1 className="text-5xl font-bold leading-tight mb-4">Raid Recap</h1>
        <p className={`text-lg text-gray-300 mb-8 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
          {subTitles[subtitleIndex]}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {getTeamCards()}
        </div>
      </div>
  </div>
  );
}

const getSubTitle = () => {
  const index = Math.floor(Math.random() * subTitles.length);
  return subTitles[index];
}

const getTeamCards = () => {
  return Object.values(RaidTeams).map((team) => {
    return (
      <a key={team.id} href={`${publicBase}/teams/${team.id}`} className="opacity-85 hover:opacity-100">
        <div className="bg-gray-500 rounded-lg shadow-lg p-8 flex flex-col justify-between items-center h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex-grow flex items-center justify-center">
            <Image
              src={`${publicBase}/logos/${team.logo}`}
              alt={team.name}
              width={180}
              height={180}
              className="mx-auto"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">{team.name}</h2>
        </div>
      </a>
    );
  });
};
