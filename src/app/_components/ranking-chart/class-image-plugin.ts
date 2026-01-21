import {Chart, Plugin} from "chart.js";
import {Bar} from "react-chartjs-2";
import {publicBase} from "@/app/_config/paths";

// Image cache outside the plugin to persist across renders
const imageCache = new Map<string, HTMLImageElement>();

function preloadClassImage(className: string): HTMLImageElement {
  const cacheKey = className.toLowerCase();

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  const img = new Image();
  img.src = `${publicBase}/classicons/classicon_${cacheKey}.jpg`;
  imageCache.set(cacheKey, img);
  return img;
}

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

      // Use cached image instead of creating new one
      const playerClass = (data.datasets[0] as any)
        .playerClass[index].toLowerCase();
      const classImage = preloadClassImage(playerClass);

      // Only draw if image is loaded
      if (classImage.complete) {
        ctx.drawImage(classImage, xPosition - (barWidth / 2) + (padding / 2), yPosition - barWidth, imageSize, imageSize);
      }
    });
  }
}
