const ActivityItem = ({ label, value }) => (
  <div className="activity-item transform transition-all duration-300 hover:translate-x-2 hover:bg-white hover:bg-opacity-10">
    <div className="activity-number text-3xl font-bold text-teal-400">
      {value.toLocaleString()}
    </div>
    <div className="activity-label text-gray-400 text-sm">{label}</div>
  </div>
);

export default ActivityItem;
