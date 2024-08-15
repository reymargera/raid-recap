import {Chart, Plugin} from "chart.js";
import {Bar} from "react-chartjs-2";
import {publicBase} from "@/app/_config/paths";

export const ClassImage: Plugin<"bar"> = {
    id: 'classImage',
    beforeDatasetsDraw(chart, args, options): void {
        const {ctx, data} = chart;

        const padding = options.padding ?? 2;
        const barElements = chart.getDatasetMeta(0).data;

        barElements.forEach((bar, index) => {

            const barWidth = (chart.getDatasetMeta(0).data[index] as any).width;
            const imageSize = barWidth - padding;

            const xPosition = chart.getDatasetMeta(0).data[index].x;
            const yPosition = chart.getDatasetMeta(0).data[index].y;


            const classImage = new Image();
            const playerClass = (data.datasets[0] as any)
                .playerClass[index].toLowerCase();
            classImage.src = `${publicBase}/classicons/classicon_${playerClass}.jpg`;

            ctx.drawImage(classImage, xPosition - (barWidth / 2) + (padding / 2), yPosition - barWidth, imageSize, imageSize);
        });
    }
}
