//import { useEffect, useState } from "react";

const StatCard = ({ type, icon, value, label, change, changeType }) => {
  const display = typeof value === 'number' ? value.toLocaleString() : String(value || '');
  //const[loading, setLoading] = useState(true);

  return (
    <div className={`stat-card ${type} transform transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl`}>
      <div className="relative overflow-hidden">
        <div className="shimmer"></div>

        <div className={`stat-icon ${type}-icon flex items-center justify-center`}>
          {icon}
        </div>

        <div className="stat-number text-4xl font-bold mb-2 animate-pulse">
          {display}
        </div>

        <div className="stat-label text-gray-400 text-lg mb-3">{label}</div>

        <div className="loading-bar"></div>

      </div>
    </div>
  );
};

export default StatCard;
