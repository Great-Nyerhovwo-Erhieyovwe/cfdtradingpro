import { useEffect, useRef } from "react";
import { createChart, LineStyle, ColorType, LineSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";

type AssetCardProps = {
  name: string;
  symbol: string;
  price: string;
  change: number; // percent
  data: number[]; // mock price series
};

export const AssetCard = ({
  name,
  symbol,
  price,
  change,
  data,
}: AssetCardProps) => {
  const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: 150,
      height: 60,
      layout: { background: { type: ColorType.Solid, color: "transparent" } },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
    });

    const series = chart.addSeries(LineSeries, {
      color: "#00d8ff",
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
    });
    series.setData(data.map((v, i) => ({ time: i as UTCTimestamp, value: v })));

    return () => chart.remove();
  }, [data]);

  const changeColor = change >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="flex w-full flex-col items-start p-3 sm:p-4 border border-white/20 shadow-lg rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex w-full justify-between text-xs sm:text-sm text-white">
        <span className="font-medium">{name}</span>
        <span className="text-white/60">{symbol}</span>
      </div>
      <div className="mt-2 text-base sm:text-lg font-medium text-accent">{price}</div>
      <div className={`mt-1 text-xs sm:text-sm ${changeColor}`}>
        {change > 0 ? "+" : ""}
        {change.toFixed(2)}%
      </div>
      <div ref={chartContainer} className="mt-3 w-full" />
    </div>
  );
};