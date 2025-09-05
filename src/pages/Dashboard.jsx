import React, { useMemo, useState, useCallback } from "react";
import { FaChair, FaFilm, FaGlobe } from "react-icons/fa";
import { RiRobot2Fill, RiRefreshLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getSession, isAllowedAuthority, clearSession, canAccessCenter } from "../utils/auth";
import { Button } from "../components/ui/button";
import useDashboardData from "../hooks/useDashboardData";
import useToast from "../hooks/useToast";
import useDeleteCenter from "../hooks/useDeleteCenter";
import useDashboardSelectors from "../hooks/useDashboardSelectors";

import { timeFilters } from "../constants/data";
import ChartOverview from "../components/ui/ChartOverview";

import WorldMap from "../components/WorldMap";
import StatCard from "../components/ui/StatCard";

import DashboardHeader from "../components/sections/DashboardHeader";
import DailySummary from "../components/sections/DailySummary";
import StatisticsTable from "../components/tables/StatisticsTable";
import ConfirmModal from "../components/modals/ConfirmModal";


export default function Dashboard() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("7 Days");
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const {
    lastUpdate,
    ttlPeopleCount,
    ttlfavMov,
    ttlvisMach,
    tableRows: initialRows,
    topRegionName,
    dailyStats,
    statistics,
    refetch,
  } = useDashboardData();

  const {
    selectedCountry,
    setSelectedCountry,
    tableRowsLocal,
    setTableRowsLocal,
    filteredChartSeries,
    filteredRows,
    filteredTodayPeople,
    todayActiveMachines,
    topMovieToday,
    filteredTotalPeople,
    filteredAllTime,
    filteredFavMovieAllTime,
  } = useDashboardSelectors({ initialRows, dailyStats, statistics });

  const {
    showConfirmModal,
    deletingId,
    requestDelete,
    confirmDelete,
    cancelDelete,
  } = useDeleteCenter({
    onAfterDelete: () => { },
    showToast,
  });
  //for turning back to top region


  const headerCards = useMemo(
    () => [
      {
        type: "confirmed",
        icon: <FaChair size={28} />,
        value: selectedCountry ? filteredTotalPeople : ttlPeopleCount,
        label: "Total Seats Occupied",
      },
      {
        type: "recovered",
        icon: <RiRobot2Fill size={28} />,
        value: selectedCountry ? filteredAllTime.activeMachines : ttlvisMach,
        label: "Active Machines",
      },
      {
        type: "deaths",
        icon: <FaFilm size={28} />,
        value: selectedCountry ? filteredFavMovieAllTime : ttlfavMov,
        label: "Top Movie",
      },
      {
        type: "active",
        icon: <FaGlobe size={28} />,
        value: selectedCountry ? selectedCountry : topRegionName,
        label: selectedCountry ? "Selected Country" : "Top Region",
      },
    ],

    [
      selectedCountry,
      ttlPeopleCount,
      ttlfavMov,
      ttlvisMach,
      topRegionName,
      filteredAllTime.activeMachines,
      filteredFavMovieAllTime,
      filteredTotalPeople
    ]

  );


  const overrideTodayValue =
    selectedTimeFilter === "All Time"
      ? selectedCountry
        ? filteredTodayPeople
        : Number(dailyStats.totalPeople || 0)
      : null;

  const onOpenDetails = (row) => {
    navigate(`/detail/${encodeURIComponent(row.centerId)}`, {
      state: { row, from: "dashboard" },
    });
  };


  const onDeleteRow = (row) => {
    requestDelete(row, tableRowsLocal, setTableRowsLocal);
  };

  const handleResetFilters = useCallback(() => {
    setSelectedCountry(null);
    setSelectedTimeFilter("7 Days");
    setTableRowsLocal(initialRows || []);
    showToast("Filters cleared", "success");
  }, [setSelectedCountry, setSelectedTimeFilter, setTableRowsLocal, initialRows, showToast]);

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-5">
      {/* Toast */}
      <Button
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
        onClick={() => {
          clearSession();
          navigate("/login");
        }}
      >
        Logout
      </Button>
      <Link
        to="/dashboard/register"
        className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-md transition duration-300"
      >
        Register
      </Link>

      <div
        className={`fixed top-6 right-6 z-[60] transition-all duration-300 ${toast.visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-3 pointer-events-none"
          }`}
        role="status"

        aria-live="polite"
      >

        <div
          className={`px-4 py-3 rounded-xl shadow-2xl glass-card border backdrop-blur-md min-w-[260px]
          ${toast.type === "success"
              ? "border-emerald-400/30 bg-emerald-500/10"
              : "border-rose-400/30 bg-rose-500/10"
            }`}
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-2.5 w-2.5 rounded-full ${toast.type === "success" ? "bg-emerald-400" : "bg-rose-400"
                }`}
            />
            <p className="text-sm text-white/90">{toast.message}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <DashboardHeader lastUpdate={lastUpdate} />

        {/* World Map */}
        <div className="mb-10 relative">
          <WorldMap
            onSelectCountry={(countryName) => setSelectedCountry(countryName)}
          />

          {selectedCountry && (
            <button
              onClick={handleResetFilters}
              aria-label="Reset filters"
              title="Reset filters"
              className="group absolute top-3 right-3 inline-flex items-center gap-2 px-4 py-2 rounded-full
               border border-white/20 bg-white/10 backdrop-blur-md shadow-lg
               hover:bg-white/15 hover:border-white/30 transition-all duration-200"
            >
              <RiRefreshLine className="h-4 w-4" />
              <span className="text-sm">Reset filters</span>
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {headerCards.map((c, i) => (
            <StatCard key={i} {...c} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-semibold">📊 Chart Overview </h3>
              <div className="flex gap-3">
                {timeFilters.map((f) => (
                  <button
                    key={f}
                    className={`time-btn ${selectedTimeFilter === f ? "active" : ""
                      }`}
                    onClick={() => setSelectedTimeFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <ChartOverview
              series={filteredChartSeries}
              selectedTimeFilter={selectedTimeFilter}
              overrideTodayValue={overrideTodayValue}
            />
          </div>

          {/* Daily Summary */}
          <DailySummary
            totalSeats={
              selectedCountry
                ? filteredTodayPeople
                : Number(dailyStats.totalPeople || 0)
            }
            topMovie={topMovieToday}
            activeMachines={
              selectedCountry ? todayActiveMachines : Number(dailyStats.activeMachines || 0)
            }
          />

        </div>

        {/* Table */}
        <StatisticsTable
          rows={filteredRows}
          onOpenDetails={onOpenDetails}
          onDelete={onDeleteRow}
          deletingId={deletingId}
        />
      </div>

      <ConfirmModal
        open={showConfirmModal}
        title="Delete Confirmation"
        message="Are you sure you want to delete this center?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        onConfirm={() => confirmDelete(setTableRowsLocal, refetch)}
        onCancel={cancelDelete}
        busy={!!deletingId}
      />
    </div>
  );
}
