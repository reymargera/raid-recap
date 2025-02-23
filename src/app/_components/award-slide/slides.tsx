'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Keyboard, Mousewheel, Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";
import {Award, CurrentAwards, TeamBits} from "@/app/_config/awards";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import RankingChart from "@/app/_components/ranking-chart/ranking-chart";
import Image from "next/image";
import {Dispatch, SetStateAction, useState} from "react";
import {publicBase} from "@/app/_config/paths";

export interface AwardSlidesProps {
    team: Team;
}

function generateViewToggle(value: boolean, updateValue: Dispatch<SetStateAction<boolean>>) {
    return (
        <div className={"fixed top-4 right-4 z-50"}>
            <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" onClick={() => updateValue(value => !value)}/>
                <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gray-500"></div>
                <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Avg. Per Night</span>
            </label>
        </div>
    );
}

function generateHomeButton() {
    return (
        <div className={"fixed top-4 left-4 z-50"}>
            <a href={`${publicBase}`}>
                <button type="button" className={"text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"}>Return Home</button>
            </a>
        </div>
    );
}

export default function AwardSlides(props: AwardSlidesProps) {
    const [useOverall, setOverall] = useState(true);

    const {team} = props;
    const teamBits = TeamBits[team.id] ?? [];
    const awards = [...CurrentAwards, ...teamBits];

    const titleSlide = generateTitleSlide(team);
    const awardSlides = generateAwardSlides(team, awards, useOverall);
    const disclaimerSlide = generateDisclaimerSlide();
    const viewToggle = generateViewToggle(useOverall, setOverall);
    const homeButton = generateHomeButton();

    return (
        <>
            {viewToggle}
            {homeButton}
            <Swiper
                direction={'vertical'}
                slidesPerView={1}
                spaceBetween={30}
                mousewheel={true}
                pagination={{clickable: true,}}
                keyboard={{ enabled: true, pageUpDown: true}}
                modules={[Mousewheel, Pagination, Keyboard]}
                className="awards-slides"
            >
                {titleSlide}
                {disclaimerSlide}
                {awardSlides}
            </Swiper>
        </>
    );
};

function generateTitleSlide(team: Team) {
    return generateTextSlide(team.name, ["The War Within", "Season 1 Award Ceremony"]);
}

function generateDisclaimerSlide() {
    return generateTextSlide('Disclaimer', [
        "All of the following stats have been taken directly from Warcraft Logs " +
            "and meant to be taken in as a light-hearted and humorous recap of the season. The stats shown should not be interpreted as a " +
            "measurement of player skill or overall contribution to the raid team. Players not meeting an attendance threshold are excluded " +
            "and alts are not currently being tracked which can skew some of the data.",
    ]);
}

function generateTextSlide(heading: string, subtext: string[]) {
    return (
        <SwiperSlide>
            <div className={"min-h-screen justify-center items-center"}>
                <div className={"flex flex-col p-8 min-h-screen justify-center content-center"}>
                    <h1 className={"b-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-white p-2"}>{heading}</h1>
                    {subtext.map((text, index) => (
                        <p key={index} className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48"}>{text}</p>
                    ))}
                    {/*<p className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48 dark:text-white-400"}>{subtext}</p>*/}
                </div>
            </div>
        </SwiperSlide>
    );
}

function generateAwardSlides(team: Team, awards: Award[], userOverall: boolean) {
    let content;

    if (team.stats?.length === 0 || awards.length === 0) {
        content = (
            <SwiperSlide>
                <h1>No data or awards have been configured for {team.name}</h1>
            </SwiperSlide>
        );
    } else {
        content = awards.map(a => {
            const playerStats: PlayerStats[] = team.stats.map(PlayerStats.fromJson);

            let hasNonZeroStat = playerStats.some(p => a.stat(p) > 0);
            if (!hasNonZeroStat) {
                return null;
            }

            return (
                <SwiperSlide key={a.name}>
                    <div className={"min-h-screen justify-center items-center"}>
                        <Image src={`${publicBase}/backgrounds/${a.background ?? 'nerubar-broll-1.jpg'}`}
                               alt={a.background ?? 'nerubar-broll-1.jpg'}
                               className={"slide-background object-cover object-center"}
                               fill={true}
                        />
                        <div className={"flex flex-col p-8 min-h-screen justify-center content-center"}>
                            <div className={"award-heading"}>
                                <h1 className={"b-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-white p-2"}>{a.name}</h1>
                                <p className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48"}>{a.description}</p>
                            </div>
                            <div className={"ranking-chart"}>
                                <RankingChart
                                    playerStats={playerStats}
                                    statSelection={a.stat}
                                    filter={a.playerFilter}
                                    useOverall={a.supportsAveraging ? userOverall : true}/>
                            </div>
                            {!a.supportsAveraging && !userOverall && (
                                <div>
                                    <p className={"text-sm font-normal text-white"}>*Stat does not support per raid night averaging</p>
                                </div>
                            )}
                        </div>
                    </div>
                </SwiperSlide>
            );
        }).filter(a => a !== null);
    }

    return content;
}
