'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Mousewheel, Pagination, Keyboard} from 'swiper/modules';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";
import {CurrentAwards} from "@/app/_config/awards";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";

export interface Award {
    readonly name: string;
    readonly description: string;
    readonly statSort?: (a: PlayerStats, b: PlayerStats) => number;
}
export interface AwardSlidesProps {
    team: Team;
}

export default function AwardSlides(props: AwardSlidesProps) {
    const {team} = props;
    const awards = CurrentAwards;
    let content;

    if (team.stats?.length === 0 || awards.length === 0) {
        content = (
            <SwiperSlide>
                <h1>No data or awards have been configured for {team.name}</h1>
            </SwiperSlide>
        );
    } else {
        content = awards.map(a => {
            const playerStats: PlayerStats[] = props.team.stats.map(PlayerStats.fromJson);
            const sortedStats = playerStats.sort(a.statSort);

            const labels = sortedStats.map(p => p.name);
            const options = {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: a.name,
                    },
                },
            };

            const data = {
                labels,
                datasets: [{
                    // barPercentage: 0.5,
                    // barThickness: 6,
                    // maxBarThickness: 8,
                    // minBarLength: 2,
                    data: sortedStats.map(a.stat),
                }]
            };

            return (
                <SwiperSlide key={a.name}>
                    <Bar data={data} options={options}/>
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
