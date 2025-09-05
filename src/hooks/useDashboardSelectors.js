// src/hooks/useDashboardSelectors.js
import { useMemo, useState, useEffect } from "react";
import useChartData, { useChartDataByCountry } from "../hooks/useChartData";
import useBaseTables from "../hooks/useBaseTables";
import { formatDateKey, toDateSafe } from "../utils/date";
import {
  buildCenterIdToCountryName,
  normalizeCountryName,
} from "../utils/country";

export default function useDashboardSelectors({
  initialRows,
  dailyStats,
  
}) {
  
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [tableRowsLocal, setTableRowsLocal] = useState(initialRows || []);

  const chartSeries = useChartData();
  const chartSeriesByCountry = useChartDataByCountry(selectedCountry);
  const { location, city, country, statistics } = useBaseTables();

  useEffect(() => {
    setTableRowsLocal(initialRows || []);
  }, [initialRows]);

  const filteredChartSeries = useMemo(() => {
    if (!chartSeries?.length) return [];
    if (!selectedCountry) return chartSeries;
    return chartSeriesByCountry;
  }, [chartSeries, selectedCountry, chartSeriesByCountry]);

  const filteredRows = useMemo(() => {
    if (!selectedCountry) return tableRowsLocal;
    const normSel = normalizeCountryName(selectedCountry);
    return tableRowsLocal.filter(
      (r) => normalizeCountryName(r.country) === normSel
    );
  }, [selectedCountry, tableRowsLocal]);

  const todayKey = formatDateKey(new Date());

  const filteredTodayPeople = useMemo(() => {
    const source = selectedCountry ? chartSeriesByCountry : chartSeries;
    if (!source?.length) return 0;

    return source.reduce((sum, e) => {
      const d = toDateSafe(e.date);
      if (!d) return sum;
      if (formatDateKey(d) === todayKey) {
        return sum + (Number(e.visitors) || 0);
      }
      return sum;
    }, 0);
  }, [chartSeries, chartSeriesByCountry, selectedCountry, todayKey]);

  const filteredTotalPeople = useMemo(() => {
    if (!selectedCountry) return 0;
    const normSel = normalizeCountryName(selectedCountry);
    return (tableRowsLocal || [])
      .filter((r) => normalizeCountryName(r.country) === normSel)
      .reduce((acc, r) => acc + (Number(r.totalPeople) || 0), 0);
  }, [selectedCountry, tableRowsLocal]);

  const filteredAllTime = useMemo(() => {
    if (!selectedCountry) return dailyStats; // not used when no selection
    const normSel = normalizeCountryName(selectedCountry);
    const rows = (tableRowsLocal || []).filter(
      (r) => normalizeCountryName(r.country) === normSel
    );
    return {
      // count of visible centers in that country (all-time)
      activeMachines: rows.length,
    };
  }, [selectedCountry, tableRowsLocal, dailyStats]);

  const centerIdToCountryName = useMemo(
    () => buildCenterIdToCountryName({ location, city, country }),
    [location, city, country]
  );

  // ---- Today-only stats for selected country (for Daily Activities) ----
  const todayActiveMachines = useMemo(() => {
    if (!selectedCountry) return Number(dailyStats?.activeMachines || 0);
    if (!statistics?.length) return 0;

    const normSel = normalizeCountryName(selectedCountry);
    const todayCenters = new Set();

    (statistics || []).forEach((stat) => {
      const d = toDateSafe(stat.date);
      if (!d || isNaN(d)) return;
      const key = formatDateKey(d);
      if (key !== todayKey) return;

      const centerCountry =
        centerIdToCountryName.get(
          String(stat.center_id || stat.centerId || "")
        ) || "";
      if (normalizeCountryName(centerCountry) === normSel) {
        const cid = String(stat.center_id || stat.centerId || "");
        if (cid) todayCenters.add(cid);
      }
    });

    return todayCenters.size;
  }, [
    statistics,
    selectedCountry,
    centerIdToCountryName,
    todayKey,
    dailyStats,
  ]);

  // ---- All-time favorite movie for selected country (for StatCards) ----
  const filteredFavMovieAllTime = useMemo(() => {
    if (!selectedCountry) return dailyStats?.favMovie || "No";
    if (!statistics?.length) return "No";

    const normSel = normalizeCountryName(selectedCountry);
    const movieCounts = {};

    (statistics || []).forEach((stat) => {
      const centerCountry =
        centerIdToCountryName.get(
          String(stat.center_id || stat.centerId || "")
        ) || "";
      if (normalizeCountryName(centerCountry) !== normSel) return;

      const raw = (stat.movie_name || stat.MovieName || "").toString().trim();
      if (
        !raw ||
        /^no$/i.test(raw) ||
        /^test$/i.test(raw) ||
        /^notexist$/i.test(raw)
      )
        return;

      movieCounts[raw] = (movieCounts[raw] || 0) + 1;
    });

    const sorted = Object.entries(movieCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "No";
  }, [statistics, selectedCountry, centerIdToCountryName, dailyStats]);

  const topMovieToday = useMemo(() => {
    const movieStats = {};
    
    (statistics || []).forEach((stat) => {
      const d = toDateSafe(stat.date);
      if (!d || isNaN(d)) return;

      const key = formatDateKey(d);
      if (key !== todayKey) return;

      const countryNameOfCenter = centerIdToCountryName.get(
        String(stat.center_id || stat.centerId || "")
      );
      if (
        selectedCountry &&
        (!countryNameOfCenter ||
          normalizeCountryName(countryNameOfCenter) !==
            normalizeCountryName(selectedCountry))
      ) {
        return;
      }

      const seats = Number(stat.seats_occupied || stat.Seats || 0) || 0;
      const movieRaw = stat.movie_name || stat.MovieName || "";
      const movie = movieRaw.toString().trim();

      if (!movie || movie.toLowerCase() === "no") {
        return;
      }

      movieStats[movie] = (movieStats[movie] || 0) + seats;
    });

    const sorted = Object.entries(movieStats).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || "-";
  }, [statistics, selectedCountry, centerIdToCountryName, todayKey]);

  return {
    // state
    selectedCountry,
    setSelectedCountry,
    tableRowsLocal,
    setTableRowsLocal,

    // derived for Chart and Table
    filteredChartSeries,
    filteredRows,

    // today-only
    filteredTodayPeople,
    todayActiveMachines,
    topMovieToday,

    // all-time for selected country
    filteredTotalPeople,
    filteredAllTime,
    filteredFavMovieAllTime,
  };
}
