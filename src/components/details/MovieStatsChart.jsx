// src/components/details/MovieStatsChart.jsx
import React, { useMemo } from "react";
import { Card, CardContent } from "../ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const piePalette = {
  Woc: "#60A5FA",
  Motoride2: "#A78BFA",
  "Galaxy Wars": "#22D3EE",
  "Ocean Deep": "#10B981",
  "Space Journey": "#F59E0B",
  Other: "#64748B",
};
const fallbackColors = ["#60A5FA", "#A78BFA", "#22D3EE", "#10B981", "#F59E0B", "#F87171", "#F472B6", "#34D399"];
const MAX_SLICES = 5;
const PIE_LABEL_MIN = 5;
const RAD = Math.PI / 180;

export default function MovieStatsChart({ rows = [] }) {
  const legend = useMemo(() => {
    const byMovie = new Map();
    for (const r of rows) {
      const name = r.movie || "—";
      const val = r.seats || 0;
      byMovie.set(name, (byMovie.get(name) || 0) + val);
    }
    const total = Array.from(byMovie.values()).reduce((a, b) => a + b, 0);
    const items = Array.from(byMovie, ([name, value]) => ({ name, value }));
    items.sort((a, b) => b.value - a.value);
    return items.map((e, i) => ({
      name: e.name,
      color: piePalette[e.name] || fallbackColors[i % fallbackColors.length],
      ratio: total ? e.value / total : 0,
    }));
  }, [rows]);

  const chartData = useMemo(() => {
    const top = legend.slice(0, MAX_SLICES);
    const rest = legend.slice(MAX_SLICES);
    const otherRatio = rest.reduce((s, e) => s + e.ratio, 0);
    if (otherRatio > 0) top.push({ name: "Other", color: piePalette.Other, ratio: otherRatio });
    return top;
  }, [legend]);

  const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent, index }) => {
    const p = Math.round((percent || 0) * 100);
    if (p < PIE_LABEL_MIN) return null;
    const r = outerRadius + 36;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    const color = chartData[index]?.color || "#fff";
    const name = chartData[index]?.name || "";
    return (
      <text x={x} y={y} fill={color} fontSize={16} fontWeight={600} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${name} ${p}%`}
      </text>
    );
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Movies Statistics</h3>
        <div className="h-64 flex items-center justify-center !border-0 !ring-0 !outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart style={{ border: "none", outline: "none", boxShadow: "none", background: "transparent" }}>
              <Pie
                data={chartData}
                dataKey="ratio"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={70}
                paddingAngle={1.3}
                startAngle={90}
                endAngle={-270}
                stroke="transparent"
                strokeWidth={0}
                label={renderPieLabel}
                labelLine={false}
                isAnimationActive={false}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`slice-${idx}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 mt-6">
          {legend.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/90">
                {item.name} {Math.round(item.ratio * 100)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
