import {Chart} from "chart.js";
import {Bar} from "react-chartjs-2";

export const ClassImage = {
    id: 'classImage',
    beforeDatasetsDraw(chart: Chart<Bar>, args: { cancelable: false }, options): void {
        const {ctx, data} = chart;

        const padding = options.padding ?? 2;
        const barElements = chart.getDatasetMeta(0).data;

        barElements.forEach((bar, index) => {

            const barWidth = chart.getDatasetMeta(0).data[index].width;
            const imageSize = barWidth - padding;

            const xPosition = chart.getDatasetMeta(0).data[index].x;
            const yPosition = chart.getDatasetMeta(0).data[index].y;


            const classImage = new Image();
            const playerClass = data.datasets[0].playerClass[index].toLowerCase();
            classImage.src = `https://render-us.worldofwarcraft.com/icons/56/classicon_${playerClass}.jpg`;

            ctx.drawImage(classImage, xPosition - (barWidth / 2) + (padding / 2), yPosition - barWidth, imageSize, imageSize);
        });
    }
}
