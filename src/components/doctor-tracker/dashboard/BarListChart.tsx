"use client";

import { memo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BarListChartProps {
  data: { name: string; count: number }[];
  color?: string;
  /** Label shown in the tooltip, e.g. "Patients". */
  seriesName: string;
}

const truncate = (value: string) => (value.length > 18 ? `${value.slice(0, 17)}…` : value);

/** Horizontal ranked bars; long names stay readable because they sit on the Y axis. */
function BarListChart({ data, color = "#2558B3", seriesName }: BarListChartProps) {
  const height = Math.max(220, data.length * 36 + 24);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barSize={16}>
        <CartesianGrid stroke="#EEF2F7" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickFormatter={truncate}
          tick={{ fontSize: 12, fill: "#334155" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "#F4F7FD" }} />
        <Bar dataKey="count" name={seriesName} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(BarListChart);
