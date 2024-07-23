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
            console.log('Creating Award Slide for', a.name);
            const playerStats: PlayerStats[] = props.team.stats.map(PlayerStats.fromJson);

            const style = {
                backgroundImage: `url(https://render.worldofwarcraft.com/us/profile-backgrounds/v2/armory_bg_class_warlock.jpg)`
            }

            return (
                <SwiperSlide key={a.name}>
                    <RankingChart playerStats={playerStats} statSort={a.statSort} statSelection={a.stat} />
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
