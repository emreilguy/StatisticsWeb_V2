// src/components/tables/StatisticsTable.jsx
import React from "react";
import { TbListDetails, TbTrash } from "react-icons/tb";
import { formatYMD } from "../../utils/date";

export default function StatisticsTable({ rows, onOpenDetails, onDelete, deletingId }) {
  return (
    <div className="glass-card p-8">
      <h3 className="text-2xl font-semibold mb-6 text-orange-400"></h3>
      <div className="overflow-x-auto">
        <div className="max-h-[65vh] overflow-y-auto rounded-xl">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-[#233772] to-[#2F3F87]">
                {["Continent", "Country", "City", "Center Name", "Project Code", "Total Seats", "Top Movie", "Last Updated", ""].map(h => (
                  <th key={h} className="px-6 py-4 text-left font-semibold sticky top-0 z-20 bg-inherit">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.centerId || index}
                  onDoubleClick={() => onOpenDetails(row)}
                  className="border-b border-white/10 odd:bg-white/[0.05] even:bg-white/[0.008] hover:bg-white/10 transition-colors cursor-pointer select-none"
                >
                  <td className="px-6 py-4">{row.region}</td>
                  <td className="px-6 py-4">{row.country}</td>
                  <td className="px-6 py-4">{row.city}</td>
                  <td className="px-6 py-4">{row.centerName}</td>
                  <td className="px-6 py-4">{row.projectCode}</td>
                  <td className="px-6 py-4">{row.totalPeople.toLocaleString()}</td>
                  <td className="px-6 py-4">{row.favoriteMovie}</td>
                  <td className="px-6 py-4">{formatYMD(row.lastUpdated)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onOpenDetails(row); }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-teal-400 transition"
                        title="View details"
                        aria-label="View details"
                      >
                        <TbListDetails size={20} className="opacity-80 hover:opacity-100" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring focus-visible:ring-rose-400 transition disabled:opacity-50"
                        title="Delete"
                        aria-label="Delete"
                        disabled={deletingId === row.centerId}
                      >
                        <TbTrash size={20} className="opacity-80 hover:opacity-100" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td className="px-6 py-8 text-center text-white/60" colSpan={9}>No data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
