import { useMemo } from "react";
import useBaseTables from "./useBaseTables";
import {
  normalizeCenters,
  normalizeStats,
  parseStatDate,
} from "../utils/dashboardFunctions";

export function useChartDataByCountry(countryName) {
  const { statistics, country, city, location } = useBaseTables();

  const chartSeries = useMemo(() => {
    if (
      !statistics?.length ||
      !location?.length ||
      !country?.length ||
      !city?.length ||
      !countryName
    ) {
      return [];
    }

    const selectedCountryId = country.find((c) => c.name === countryName)?.id;
    if (!selectedCountryId) return [];

    const countryCities = city.filter(
      (c) => c.country_id === selectedCountryId
    );
    const countryCityIds = countryCities.map((c) => c.id);

    const centers = location.filter((c) => countryCityIds.includes(c.city_id));
    const visibleIds = new Set(
      centers.filter((c) => c.visible).map((c) => String(c.id))
    );

    const statsArr = normalizeStats(statistics).filter(
      (s) => s.center_id && visibleIds.has(String(s.center_id))
    );

    const result = statsArr
      .map((s) => {
        const dt = parseStatDate(s.date, s.hour);
        if (!dt) return null;
        return {
          date: dt,
          visitors: Number(s.seats_occupied ?? 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);

    return result;
  }, [statistics, location, country, city, countryName]);

  return chartSeries;
}

export default function useChartData() {
  const { statistics, location } = useBaseTables();

  const chartSeries = useMemo(() => {
    if (!statistics?.length || !location?.length) return [];

    const centers = normalizeCenters(location);
    const visibleIds = new Set(
      centers.filter((c) => c.visible).map((c) => String(c.id))
    );

    const statsArr = normalizeStats(statistics).filter(
      (s) => s.center_id && visibleIds.has(String(s.center_id))
    );

    const result = statsArr
      .map((s) => {
        const dt = parseStatDate(s.date, s.hour);
        if (!dt) return null;
        return {
          date: dt,
          visitors: Number(s.seats_occupied ?? 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date);

    return result;
  }, [statistics, location]);

  return chartSeries;
}
