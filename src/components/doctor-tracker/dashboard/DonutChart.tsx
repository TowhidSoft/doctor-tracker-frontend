"use client";

import { memo, useMemo } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DonutChartProps {
  data: { name: string; count: number }[];
  /** Fixed colour per slice name; unknown names fall back to the palette in order. */
  colors?: Record<string, string>;
  centerLabel: string;
}

const PALETTE = ["#2558B3", "#2BAE90", "#F5821F", "#6C8EDB", "#8FD3C0", "#F7B77A", "#94A3B8", "#1B4187"];

function DonutChart({ data, colors = {}, centerLabel }: DonutChartProps) {
  const { slices, total } = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + item.count, 0);
    return {
      total: sum,
      slices: data.map((item, index) => ({
        ...item,
        fill: colors[item.name] ?? PALETTE[index % PALETTE.length],
        percent: sum ? Math.round((item.count / sum) * 100) : 0,
      })),
    };
  }, [data, colors]);

  return (
    <div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={slices} dataKey="count" nameKey="name" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none" />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-poppins text-2xl font-semibold text-secondary-dark">{total}</p>
            <p className="text-xs text-text-secondary">{centerLabel}</p>
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: slice.fill }} aria-hidden />
              <span className="truncate text-secondary">{slice.name}</span>
            </span>
            <span className="shrink-0 text-text-secondary">
              {slice.count} <span className="text-xs">({slice.percent}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default memo(DonutChart);
