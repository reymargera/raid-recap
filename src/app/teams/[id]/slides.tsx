'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Mousewheel, Pagination, Keyboard} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";

export interface AwardSlidesProps {
    team: Team;
}

export default function AwardSlides(props: AwardSlidesProps) {
    const {team} = props;

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
                <SwiperSlide>
                    <h1>Slide 1</h1>
                    <h1>{team.id}</h1>
                    <h1>{team.name}</h1>
                </SwiperSlide>
                <SwiperSlide>
                    <h1>Slide 2</h1>
                    <h1>{team.id}</h1>
                    <h1>{team.name}</h1>
                </SwiperSlide>
                <SwiperSlide>
                    <h1>Slide 3</h1>
                    <h1>{team.id}</h1>
                    <h1>{team.name}</h1>
                </SwiperSlide>
            </Swiper>
        </>
    );
};
