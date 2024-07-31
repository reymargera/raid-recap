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
    statSort: (a: PlayerStats, b: PlayerStats) => number;
    statSelection: (ps: PlayerStats) => number;
    filter?: (ps: PlayerStats) => boolean;
}
export default function RankingChart(props: RankingChartProps) {
    const {playerStats, statSort, statSelection, filter} = props;

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

    const sortedStats = filteredStats.sort(statSort);
    const labels = sortedStats.map(ps => ps.name);
    const playerClasses = sortedStats.map(ps => ps.playerClass);
    const barColors = playerClasses.map(pc => ClassColors[pc]);

    const data = {
        labels,
        datasets: [{
            data: sortedStats.map(statSelection),
            backgroundColor: barColors,
            playerClass: playerClasses,
        }],
    };

    return (
      <>
        <Bar data={data} options={options} />
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
                        style: 'strong',
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
                        style: 'strong',
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
function largeNumberFormat(value, index, ticks) {
    if (value >= 1000) {
        const units = ['k', 'M', 'B', 'T'];
        const order = Math.floor(Math.log(value) / Math.log(1000));
        const unitName = units[(order - 1)];
        const num = value / 1000 ** order;

        return index % 2 === 1 ? '' : `${num}  ${unitName}`;
    }

    return value.toLocaleString();
}
