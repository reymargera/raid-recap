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
}
export default function RankingChart(props: RankingChartProps) {
    const {playerStats, statSort, statSelection} = props;

    const options = getChartGlobalOptions();
    const sortedStats = playerStats.sort(statSort);
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
    return {
        responsive: true,
        plugins: {
            classImage: {
                padding: 8,
            },
        },
        scales: {
            y: {
                ticks: {
                    callback: largeNumberFormat
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
