'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Keyboard, Mousewheel, Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";
import {CurrentAwards} from "@/app/_config/awards";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import RankingChart from "@/app/_components/ranking-chart/ranking-chart";
import Image from "next/image";

export interface AwardSlidesProps {
    team: Team;
}

export default function AwardSlides(props: AwardSlidesProps) {
    const {team} = props;
    const awards = CurrentAwards;
    let content;

    console.log('Total Awards', awards.length);
    if (team.stats?.length === 0 || awards.length === 0) {
        content = (
            <SwiperSlide>
                <h1>No data or awards have been configured for {team.name}</h1>
            </SwiperSlide>
        );
    } else {
        content = awards.map(a => {
            const playerStats: PlayerStats[] = props.team.stats.map(PlayerStats.fromJson);

            const style = {
                backgroundImage: `url(https://render.worldofwarcraft.com/us/profile-backgrounds/v2/armory_bg_class_warlock.jpg)`
            }

            return (
                <SwiperSlide key={a.name}>
                    <div className={"min-h-screen justify-center items-center"}>
                        <Image src={"/backgrounds/Fyrakk.png"}
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
                                <RankingChart playerStats={playerStats} statSort={a.statSort} statSelection={a.stat} />
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            );
        });
    }

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
                {content}
            </Swiper>
        </>
    );
};
