import { useCallback, useEffect, useState, useMemo } from "react";
import useBaseTables from "./useBaseTables";
import useReferenceDicts from "./useReferenceDicts";
import useNameMaps from "./useNameMaps";
import {
  normalizeCenters,
  normalizeStats,
  parseStatDate,
  formatAnyDate,
  safeFav,
  getModeName,
  resolveFromDicts,
  looksLikeUUID,
  createPicker,
} from "../utils/dashboardFunctions";

export default function useDashboardData() {
  const { statistics, location, region, country, city, loading } =
    useBaseTables();
  const { countryDict, cityDict, regionDict } = useReferenceDicts();
  const nameMaps = useNameMaps({ city, country, region });

  const [lastUpdate, setLastUpdate] = useState("A few minutes ago");
  const [ttlPeopleCount, setTtlPeopleCount] = useState(0);
  const [ttlfavMov, setTtlFavMov] = useState("Loading");
  const [ttlvisMach, setVisMach] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [topRegionName, setTopRegionName] = useState("—");
  const [dailyStats, setDailyStats] = useState({
    totalPeople: 0,
    favMovie: "Nothing",
    activeMachines: 0,
  });

  const resolveCityName = useCallback(
    (raw) =>
      resolveFromDicts(
        raw,
        cityDict?.size ? cityDict : nameMaps.cityNameMap,
        nameMaps.cityNameMap
      ),
    [cityDict, nameMaps.cityNameMap]
  );

  const resolveCountryName = useCallback(
    (raw) =>
      resolveFromDicts(
        raw,
        countryDict?.size ? countryDict : nameMaps.countryNameMap,
        nameMaps.countryNameMap.size
          ? nameMaps.countryNameMap
          : nameMaps.countryMap
      ),
    [countryDict, nameMaps.countryNameMap, nameMaps.countryMap]
  );

  const resolveRegionName = useCallback(
    (raw) =>
      resolveFromDicts(
        raw,
        regionDict?.size ? regionDict : nameMaps.regionNameMap,
        nameMaps.regionNameMap
      ),
    [regionDict, nameMaps.regionNameMap]
  );

  useEffect(() => {
    if (!statistics.length || !location.length) return;

    const centers = normalizeCenters(location);
    const centersVisible = centers.filter((c) => c.visible);
    const visibleCenterIds = new Set(centersVisible.map((c) => String(c.id)));
    const visibleCount = centersVisible.length;

    const statsArr = normalizeStats(statistics).filter((s) => {
      const cid = s.center_id ? String(s.center_id) : "";
      return cid && visibleCenterIds.has(cid);
    });

    // Global totals
    let totalPeople = 0;
    const movieCountAll = {};
    let globalLast = null;

    for (const s of statsArr) {
      totalPeople += s.seats_occupied;
      if (s.movie_name && !/^(notexist|test|no)$/i.test(s.movie_name)) {
        movieCountAll[s.movie_name] = (movieCountAll[s.movie_name] || 0) + 1;
      }
      const dt = parseStatDate(s.date, s.hour);
      if (dt && (!globalLast || dt > globalLast)) globalLast = dt;
    }

    setTtlPeopleCount(totalPeople);
    setTtlFavMov(safeFav(movieCountAll));
    setVisMach(visibleCount);

    if (globalLast) {
      const d = globalLast;
      const lastStr =
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      setLastUpdate(lastStr);
    }

    // Today-only
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const normalizeKey = (str) => {
      const [y, m, d] = (str || "").split(".").map((x) => parseInt(x, 10));
      if (!y || !m || !d) return "";
      return `${y}-${m}-${d}`;
    };

    const todaysStats = statsArr.filter(
      (s) => normalizeKey(s.date) === todayKey
    );
    if (todaysStats.length) {
      const mc = {};
      let dailyTotal = 0;
      const centersToday = new Set();

      for (const s of todaysStats) {
        dailyTotal += s.seats_occupied;
        if (s.movie_name && !/^(notexist|test)$/i.test(s.movie_name)) {
          mc[s.movie_name] = (mc[s.movie_name] || 0) + 1;
        }
        if (s.center_id) centersToday.add(String(s.center_id));
      }

      setDailyStats({
        totalPeople: dailyTotal,
        favMovie: safeFav(mc),
        activeMachines: centersToday.size,
      });
    } else {
      setDailyStats({ totalPeople: 0, favMovie: "No", activeMachines: 0 });
    }

    // Aggregate by center
    const statsByCenter = new Map();
    for (const s of statsArr) {
      if (!s.center_id) continue;
      if (!statsByCenter.has(s.center_id)) {
        statsByCenter.set(s.center_id, { total: 0, movies: {}, last: null });
      }
      const e = statsByCenter.get(s.center_id);
      e.total += s.seats_occupied;
      if (s.movie_name && !/^(notexist|test)$/i.test(s.movie_name)) {
        e.movies[s.movie_name] = (e.movies[s.movie_name] || 0) + 1;
      }
      const dt = parseStatDate(s.date, s.hour);
      if (dt && (!e.last || dt > e.last)) e.last = dt;
    }

    const rows = centersVisible.map((c) => {
      const e = statsByCenter.get(String(c.id)) || {
        total: 0,
        movies: {},
        last: null,
      };
      const fav = safeFav(e.movies);
      const lastTs = e.last ? e.last.getTime() : Date.parse(c.lastDate) || 0;

      const pickRaw = createPicker(c._raw || {});

      const cityRawIn = (
        pickRaw.strict("city_id", "CityId") ||
        pickRaw.strict("city", "City", "city_name", "CityName") ||
        c.city ||
        ""
      )
        .toString()
        .trim();

      let cityId = "";
      if (looksLikeUUID(cityRawIn)) {
        cityId = cityRawIn.toLowerCase();
      } else if (cityRawIn) {
        cityId = nameMaps.cityNameToId.get(cityRawIn.toLowerCase()) || "";
      }

      let countryRaw = (
        pickRaw.strict(
          "country_id",
          "CountryId",
          "country_uuid",
          "countryGuid"
        ) ||
        pickRaw.strict("country", "Country", "country_name", "CountryName") ||
        c.country ||
        ""
      )
        .toString()
        .trim();

      if ((!countryRaw || looksLikeUUID(countryRaw)) && cityId) {
        const inferred = nameMaps.cityIdToCountryId.get(cityId);
        if (inferred) countryRaw = inferred;
      }

      let regionRaw =
        pickRaw.strict("region_id", "RegionId", "region_uuid") ||
        pickRaw.strict("region", "Region") ||
        c.region ||
        "";
      if (
        (!regionRaw || !String(regionRaw).trim()) &&
        countryRaw &&
        looksLikeUUID(countryRaw)
      ) {
        regionRaw =
          nameMaps.countryIdToRegionId.get(String(countryRaw).toLowerCase()) ||
          "";
      }

      const cityForDisplay = cityId || cityRawIn;

      return {
        centerId: c.id,
        region: resolveRegionName(regionRaw),
        country: resolveCountryName(countryRaw),
        city: resolveCityName(cityForDisplay),
        centerName: c.centerName || c._raw?.Centers || "—",
        projectCode: c.projectCode || c._raw?.project_code || "—",
        totalPeople: e.total || 0,
        favoriteMovie: fav,
        lastUpdated: e.last
          ? e.last.toISOString()
          : c.lastDate
            ? new Date(c.lastDate).toISOString()
            : null,
        _ts: lastTs,
      };
    });

    rows.sort((a, b) => b._ts - a._ts);

    const withHistory = rows.map((row) => ({
      ...row,
      history: [
        {
          date: row.lastUpdated,
          visitors: row.totalPeople,
        },
      ],
    }));

    setTopRegionName(getModeName(rows, "region"));
    setTableRows(withHistory);

    // ✅ new: prepare chartSeries from history
    const historySeries = withHistory
      .flatMap((row) =>
        row.history.map((h) => ({ date: h.date, visitors: h.visitors }))
      )
      .filter((h) => h.date);

    setChartSeries(historySeries);
  }, [
    statistics,
    location,
    countryDict,
    cityDict,
    regionDict,
    resolveCityName,
    resolveCountryName,
    resolveRegionName,
    nameMaps.cityNameToId,
    nameMaps.cityIdToCountryId,
    nameMaps.countryIdToRegionId,
  ]);

  const [chartSeries, setChartSeries] = useState([]);

  const countriesWithCenters = useMemo(() => {
    const names = tableRows.map((r) => r.country).filter(Boolean);
    return Array.from(new Set(names));
  }, [tableRows]);

  return {
    loading,
    lastUpdate,
    ttlPeopleCount,
    ttlfavMov,
    ttlvisMach,
    tableRows,
    topRegionName,
    dailyStats,
    chartSeries,
    countriesWithCenters,
  };
}
