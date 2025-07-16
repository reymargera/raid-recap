'use client';

import {Swiper, SwiperSlide} from "swiper/react";
import {Keyboard, Mousewheel, Pagination} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './slides.css';

import {Team} from "@/app/teams/[id]/page";
import {Award, CurrentAwards, TeamBits} from "@/app/_config/awards";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import {TeamStats} from "@/warcraft-logs/model/team-stats";
import RankingChart from "@/app/_components/ranking-chart/ranking-chart";
import TeamStatsSlide from "@/app/_components/team-stats-slide/team-stats-slide";
import Image from "next/image";
import {Dispatch, SetStateAction, useState, useRef, useEffect} from "react";
import {publicBase} from "@/app/_config/paths";
import {ClassColors} from "@/app/_components/ranking-chart/class-colors";

export interface AwardSlidesProps {
    team: Team;
}

function generateControlButtons(useOverallRef: React.MutableRefObject<boolean>, guessMode: boolean, setGuessMode: Dispatch<SetStateAction<boolean>>, forceUpdate: () => void) {
    return (
        <div className={"fixed top-4 right-4 z-50 flex gap-2"}>
            <button
                type="button"
                onClick={() => {
                    useOverallRef.current = !useOverallRef.current;
                    forceUpdate();
                }}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none ${
                    useOverallRef.current
                        ? "bg-gray-800 hover:bg-gray-900"
                        : "bg-gray-800 hover:bg-gray-900 ring-2 ring-blue-400"
                } dark:bg-gray-800 dark:hover:bg-gray-700`}
            >
                {useOverallRef.current ? "⚫ " : "🔵 "}Avg. Per Night
            </button>
            <button
                type="button"
                onClick={() => setGuessMode(value => !value)}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none ${
                    guessMode
                        ? "bg-gray-800 hover:bg-gray-900 ring-2 ring-blue-400"
                        : "bg-gray-800 hover:bg-gray-900"
                } dark:bg-gray-800 dark:hover:bg-gray-700`}
            >
                {guessMode ? "🔵 " : "⚫ "}Guess Mode
            </button>
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

function generateWalkthroughOverlay(step: number, onNext: () => void, onSkip: () => void) {
    const walkthroughSteps = [
        {
            title: "Welcome to Award Slides!",
            description: "Let's show you the controls to make the most of your experience.",
            highlight: null,
            position: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
        },
        {
            title: "Avg. Per Night Toggle",
            description: "Toggle between total stats and per-night averages. This helps compare players with different attendance rates.",
            highlight: "avg-per-night",
            position: { top: "80px", right: "20px" }
        },
        {
            title: "Guess Mode",
            description: "Hide the results and make your predictions! Click any player name to reveal the winner.",
            highlight: "guess-mode",
            position: { top: "80px", right: "20px" }
        },
        {
            title: "Return Home",
            description: "Navigate back to the main page anytime.",
            highlight: "return-home",
            position: { top: "80px", left: "20px" }
        }
    ];

    const currentStep = walkthroughSteps[step];
    const isLastStep = step === walkthroughSteps.length - 1;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-75" />

            {/* Highlight specific elements */}
            {currentStep.highlight && (
                <div
                    className="absolute pointer-events-none"
                    style={{
                        top: '16px',
                        right: currentStep.highlight === 'avg-per-night' ? '170px' :
                               currentStep.highlight === 'guess-mode' ? '16px' : 'auto',
                        left: currentStep.highlight === 'return-home' ? '16px' : 'auto',
                        zIndex: 101
                    }}
                >
                    <div className="ring-4 ring-blue-400 ring-opacity-75 rounded-lg animate-pulse"
                         style={{
                             width: currentStep.highlight === 'avg-per-night' ? '150px' :
                                    currentStep.highlight === 'guess-mode' ? '130px' : '120px',
                             height: '45px'
                         }}
                    />
                </div>
            )}

            {/* Explanation card */}
            <div
                className="absolute bg-white rounded-lg shadow-2xl p-6 max-w-sm z-[102]"
                style={currentStep.position}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{currentStep.title}</h3>
                    <div className="text-sm text-gray-500">
                        {step + 1} of {walkthroughSteps.length}
                    </div>
                </div>

                <p className="text-gray-700 mb-6">{currentStep.description}</p>

                <div className="flex justify-between gap-3">
                    <button
                        onClick={onSkip}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Skip Tutorial
                    </button>
                    <button
                        onClick={onNext}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                        {isLastStep ? "Got it!" : "Next"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AwardSlides(props: AwardSlidesProps) {
    const useOverallRef = useRef(true);
    const [guessMode, setGuessMode] = useState(false);
    const [revealedSlides, setRevealedSlides] = useState<Set<string>>(new Set());
    const [, forceUpdate] = useState({});
    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const [walkthroughStep, setWalkthroughStep] = useState(0);

    useEffect(() => {
        const hasSeenWalkthrough = localStorage.getItem('award-slides-walkthrough-seen');
        if (!hasSeenWalkthrough) {
            setShowWalkthrough(true);
        }
    }, []);

    const {team} = props;
    const teamBits = TeamBits[team.id] ?? [];
    const awards = [...CurrentAwards, ...teamBits];

    const titleSlide = generateTitleSlide(team);
    const teamStatsSlide = generateTeamStatsSlide(team);
    const awardSlides = generateAwardSlides(team, awards, useOverallRef.current, guessMode, revealedSlides, setRevealedSlides);
    const disclaimerSlide = generateDisclaimerSlide();
    const controlButtons = generateControlButtons(useOverallRef, guessMode, setGuessMode, () => forceUpdate({}));
    const homeButton = generateHomeButton();

    const handleWalkthroughNext = () => {
        if (walkthroughStep < 3) {
            setWalkthroughStep(walkthroughStep + 1);
        } else {
            setShowWalkthrough(false);
            localStorage.setItem('award-slides-walkthrough-seen', 'true');
        }
    };

    const handleWalkthroughSkip = () => {
        setShowWalkthrough(false);
        localStorage.setItem('award-slides-walkthrough-seen', 'true');
    };

    const walkthroughOverlay = showWalkthrough ? generateWalkthroughOverlay(walkthroughStep, handleWalkthroughNext, handleWalkthroughSkip) : null;

    return (
        <>
            {controlButtons}
            {homeButton}
            {walkthroughOverlay}
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
                {teamStatsSlide}
                {awardSlides}
            </Swiper>
        </>
    );
};

function generateTitleSlide(team: Team) {
    return generateTextSlide(team.name, ["The War Within", "Season 1 Award Ceremony"]);
}

function generateTeamStatsSlide(team: Team) {
    try {
        // Create a new TeamStats instance and copy the data
        const stats = new TeamStats().fromJson(team.teamStats);
        return (
            <SwiperSlide>
                <TeamStatsSlide key="team-stats" teamStats={stats} teamName={team.name} />
            </SwiperSlide>
        );
    } catch (error) {
        console.error('Error generating team stats slide:', error);
        return (
            <SwiperSlide key="team-stats-error">
                <div className="min-h-screen flex justify-center items-center">
                    <div className="text-white text-center">
                        <h2 className="text-2xl font-bold mb-4">Team Stats Unavailable</h2>
                        <p>Unable to load team statistics data.</p>
                    </div>
                </div>
            </SwiperSlide>
        );
    }
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

function generateAwardSlides(team: Team, awards: Award[], userOverall: boolean, guessMode: boolean, revealedSlides: Set<string>, setRevealedSlides: Dispatch<SetStateAction<Set<string>>>) {
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

            const isRevealed = !guessMode || revealedSlides.has(a.name);

            const handleReveal = () => {
                if (guessMode && !revealedSlides.has(a.name)) {
                    setRevealedSlides(prev => new Set([...prev, a.name]));
                }
            };

            return (
                <SwiperSlide key={a.name}>
                    <div className={`min-h-screen justify-center items-center ${!isRevealed ? 'cursor-pointer' : ''}`} onClick={handleReveal}>
                        <Image src={`${publicBase}/backgrounds/${a.background ?? 'undermine/undermine-broll-1.webp'}`}
                               alt={a.background ?? 'undermine/undermine-broll-1.webp'}
                               className={"slide-background object-cover object-center"}
                               fill={true}
                        />
                        <div className={"flex flex-col p-8 min-h-screen justify-center content-center"}>
                            <div className={"award-heading"}>
                                <h1 className={"b-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl lg:text-6xl text-white p-2"}>{a.name}</h1>
                                <p className={"mb-6 text-lg font-normal text-white-500 lg:text-xl sm:px-16 xl:px-48"}>{a.description}</p>
                            </div>
                            <div className={"ranking-chart relative overflow-hidden"}>
                                <div className={`absolute inset-0 flex justify-center items-center transition-all duration-500 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-90'}`}>
                                    <div className={"text-center max-w-4xl px-4"}>
                                        <div className={"text-6xl mb-4"}>🤔</div>
                                        <h2 className={"text-2xl font-bold text-white mb-2"}>Make Your Guess!</h2>
                                        <p className={"text-lg text-white-400 mb-6"}>Who do you think won this award?</p>
                                        <div className={"grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6"}>
                                            {playerStats
                                                .sort((a, b) => a.name.localeCompare(b.name))
                                                .map(player => {
                                                    const classColor = ClassColors[player.playerClass] || '#FFFFFF';
                                                    return (
                                                        <button
                                                            key={player.name}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleReveal();
                                                            }}
                                                            className={"hover:scale-105 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-2 hover:border-opacity-80"}
                                                            style={{
                                                                backgroundColor: `${classColor}40`,
                                                                borderColor: classColor,
                                                            }}
                                                        >
                                                            {player.name}
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>
                                        <p className={"text-sm text-white-300"}>Click any player name to reveal the winner</p>
                                    </div>
                                </div>
                                <div className={`transition-all duration-500 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                                    <RankingChart
                                        playerStats={playerStats}
                                        statSelection={a.stat}
                                        filter={a.playerFilter}
                                        useOverall={a.supportsAveraging ? userOverall : true}/>
                                </div>
                            </div>
                            <div>
                                <p className={`text-sm font-normal text-white ${!a.supportsAveraging && !userOverall ? 'visible' : 'invisible'}`}>*Stat does not support per raid night averaging</p>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            );
        }).filter(a => a !== null);
    }

    return content;
}
