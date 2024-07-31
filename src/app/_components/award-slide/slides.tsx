'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Keyboard, Mousewheel, Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";
import {Award, CurrentAwards} from "@/app/_config/awards";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import RankingChart from "@/app/_components/ranking-chart/ranking-chart";
import Image from "next/image";

export interface AwardSlidesProps {
    team: Team;
}

export default function AwardSlides(props: AwardSlidesProps) {
    const {team} = props;
    const awards = CurrentAwards;

    const titleSlide = generateTitleSlide(team);
    const awardSlides = generateAwardSlides(team, awards);
    const disclaimerSlide = generateDisclaimerSlide();

    return (
        <>
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
    return generateTextSlide(team.name, "Dragonflight Season 4 Award Ceremony");
}

function generateDisclaimerSlide() {
    return generateTextSlide('Disclaimer', "All of the following stats have been taken directly from Warcraft Logs " +
        "and meant to be taken in as a light-hearted and humorous recap of the season. The stats shown should not be interpreted as a " +
        "measurement of player skill or overall contribution to the raid team. Players not meeting an attendance threshold are excluded " +
        "and alts are not currently being tracked which can skew some of the data.");
}

function generateTextSlide(heading: string, subtext: string) {
    return (
        <SwiperSlide>
            <div className={"min-h-screen justify-center items-center"}>
                <div className={"flex flex-col p-8 min-h-screen justify-center content-center"}>
                    <h1 className={"b-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white p-2"}>{heading}</h1>
                    <p className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48 dark:text-white-400"}>{subtext}</p>
                </div>
            </div>
        </SwiperSlide>
    );
}

function generateAwardSlides(team: Team, awards: Award[]) {
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

            return (
                <SwiperSlide key={a.name}>
                    <div className={"min-h-screen justify-center items-center"}>
                        <Image src={`/backgrounds/${a.background ?? 'Fyrakk.png'}`}
                               layout={"fill"}
                               objectFit={"cover"}
                               objectPosition={"center"}
                               className={"slide-background"}
                        />
                        <div className={"flex flex-col p-8 min-h-screen justify-center content-center"}>
                            <div className={"award-heading"}>
                                <h1 className={"b-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white p-2"}>{a.name}</h1>
                                <p className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48 dark:text-white-400"}>{a.description}</p>
                            </div>
                            <div className={"ranking-chart"}>
                                <RankingChart playerStats={playerStats} statSort={a.statSort} statSelection={a.stat} filter={a.playerFilter}/>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            );
        });
    }

    return content;
}
