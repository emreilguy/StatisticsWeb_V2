// src/components/details/DailyUsersChart.jsx
import React, { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatDotDate } from "../../utils/detailsformat";

export default function DailyUsersChart({ rows = [] }) {
  const dailySeriesByDate = useMemo(() => {
    const byDate = new Map();
    for (const r of rows) {
      if (!r.date) continue;
      byDate.set(r.date, (byDate.get(r.date) || 0) + (r.seats || 0));
    }
    const arr = Array.from(byDate, ([date, users]) => ({ date, users }));
    arr.sort((a, b) => new Date(a.date) - new Date(b.date));
    return arr.slice(-60);
  }, [rows]);

const yMax = useMemo(() => {
  const maxVal = Math.max(0, ...dailySeriesByDate.map((d) => d.users || 0));
  const step = 50;
  const rounded = Math.ceil(maxVal / step) * step;
 return (rounded || 50) * 1.1; 
}, [dailySeriesByDate]);

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardContent className="p-0 h-[300px] flex flex-col justify-center items-center">
        <h3 className="text-lg font-semibold mb-6 text-center">User Statistics</h3>
        <div className="w-full h-[200px] px-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySeriesByDate} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.18)" strokeDasharray="6 6" vertical horizontal />
              <XAxis
                dataKey="date"
                tickFormatter={formatDotDate}
                tick={{ fill: "#E6EAEE", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                minTickGap={20}
                tickMargin={10}
              />
              <YAxis
                domain={[0, yMax]}
                ticks={Array.from({ length: 5 }, (_, i) => Math.round((yMax / 4) * i))}
                tick={{ fill: "#E6EAEE", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
                contentStyle={{
                  background: "rgba(10,15,30,0.9)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  color: "#fff",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.9)" }}
                formatter={(v) => [v, "Users"]}
                labelFormatter={(label) => formatDotDate(label)}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#6FB7FF"
                strokeWidth={4}
                dot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: "#6FB7FF" }}
                activeDot={{ r: 7 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
