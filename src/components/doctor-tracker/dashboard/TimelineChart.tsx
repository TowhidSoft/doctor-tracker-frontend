"use client";

import { memo } from "react";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { shortDay } from "@/lib/date";
import type { AnalyticsOverview } from "@/redux/service/admin/analyticsApi";

function TimelineChart({ data }: { data: AnalyticsOverview["timeline"] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#EEF2F7" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDay}
          tick={{ fontSize: 12, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
          minTickGap={28}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
        <Tooltip labelFormatter={(label) => shortDay(String(label))} />
        <Legend iconType="circle" iconSize={8} verticalAlign="top" align="right" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
        <Area type="monotone" dataKey="patients" name="New patients" stroke="#2558B3" strokeWidth={2} fill="#2558B3" fillOpacity={0.12} />
        <Area type="monotone" dataKey="doctors" name="New doctors" stroke="#2BAE90" strokeWidth={2} fill="#2BAE90" fillOpacity={0.12} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default memo(TimelineChart);
