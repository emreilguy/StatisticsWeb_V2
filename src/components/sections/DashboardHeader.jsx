// src/components/sections/DashboardHeader.jsx
import React from "react";
import { RiBarChartBoxFill } from "react-icons/ri";
import { formatYMD } from "../../utils/date";

export default function DashboardHeader({ lastUpdate }) {
  return (
    <div className="text-center mb-6 p-6 glass-card">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
        <span className="inline-flex items-center gap-3">
          <RiBarChartBoxFill size={30} />
          DOF Robotics - Statistics
        </span>
      </h1>
      <p className="text-gray-300 text-lg">Real-time center statistics and data</p>
      <p className="text-gray-400 text-sm mt-2">
        Last updated: <span className="text-teal-400">{formatYMD(lastUpdate)}</span>
      </p>
    </div>
  );
}
