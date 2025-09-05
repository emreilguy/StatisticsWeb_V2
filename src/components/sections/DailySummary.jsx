// src/components/sections/DailySummary.jsx
import React from "react";
import ActivityItem from '../ui/ActivityItem';


export default function DailySummary({ totalSeats, topMovie, activeMachines }) {
  return (
    <div className="glass-card p-8">
      <h3 className="text-xl font-semibold mb-6 text-teal-400">📅 Daily Activities</h3>
      <ActivityItem label="Total Seats" value={totalSeats} />
      <ActivityItem label="Top Movie" value={topMovie} />
      <ActivityItem label="Active Machines" value={activeMachines} />
    </div>
  );
}
