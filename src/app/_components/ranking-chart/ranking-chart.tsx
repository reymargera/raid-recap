import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
} from "chart.js";
import {PlayerStats} from "@/warcraft-logs/model/player-stats";
import {ClassImage} from "@/app/_components/ranking-chart/class-image-plugin";
import {ClassColors} from "@/app/_components/ranking-chart/class-colors";
import {number} from "prop-types";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    ClassImage,
);

export interface RankingChartProps {
    playerStats: PlayerStats[];
    filter?: (ps: PlayerStats) => boolean;
    statSelection: (ps: PlayerStats) => number;
    useOverall?: boolean;
}
export default function RankingChart(props: RankingChartProps) {
    const {playerStats, statSelection, filter, useOverall} = props;

    const options = getChartGlobalOptions();

    const filteredStats = filter
        ? playerStats.map(ps => {
            return filter(ps) ? ps : new PlayerStats({
                id: ps.id,
                name: ps.name,
                server: ps.server,
                playerClass: ps.playerClass,
                spec: ps.spec,
                role: ps.role,
            });

        })
        : playerStats;

    const sortedStats = filteredStats.sort((a, b) => {
        let divisorA = useOverall ? 1 : a.appearances('Boss');
        let divisorB = useOverall ? 1 : b.appearances('Boss');

        return (statSelection(b) / divisorB) - (statSelection(a) / divisorA);
    });

    const labels = sortedStats.map(ps => ps.name);
    const playerClasses = sortedStats.map(ps => ps.playerClass);
    const barColors = playerClasses.map(pc => ClassColors[pc]);

    const data = {
        labels,
        datasets: [{
            data: sortedStats.map(p => {
                return statSelection(p) / (useOverall ? 1 : p.appearances('Boss'));
            }),
            backgroundColor: barColors,
            playerClass: playerClasses,
        }],
    };

    return (
      <>
        <Bar data={data} options={options} className={"min-w-full"} />
      </>
    );
};

function getChartGlobalOptions() {
    const fontSize = 20;
    const titleFontSize =  fontSize * 1.2;

    return {
        responsive: true,
        plugins: {
            classImage: {
                padding: 8,
            },
            tooltip: {
                titleFont: {
                    size: titleFontSize,
                },
                bodyFont: {
                    size: fontSize,
                }
            }
        },
        scales: {
            y: {
                grace: '10%',
                grid: {
                    color: "rgba(255, 255, 255, 0.7)",
                },
                ticks: {
                    callback: largeNumberFormat,
                    color: 'white',
                    font: {
                        size: fontSize,
                    }
                }
            },
            x: {
                ticks: {
                    color: 'white',
                    autoSkip: false,
                    minRotation: 45,
                    maxRotation: 45,
                    font: {
                        size: fontSize,
                    }
                }
            }
        }
    };
}

/**
 * Formats Y-axis labels to trim down larger numbers.
 * If large number criteria is met, every other tick will be skipped.
 */
function largeNumberFormat(value: number | string, index: number) {
    const tickValue = Number(value);

    if (tickValue >= 1000) {
        const units = ['k', 'M', 'B', 'T', 'Q'];
        const order = Math.floor(Math.log(tickValue) / Math.log(1000));
        const unitName = units[(order - 1)];
        const num = tickValue / 1000 ** order;

        return index % 2 === 1 ? '' : `${num}  ${unitName}`;
    }

    return tickValue.toLocaleString();
}
