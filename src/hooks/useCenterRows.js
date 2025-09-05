// src/hooks/useCenterRows.js
import { useMemo } from "react";
import {
  normalizeDate,
  normalizeHour,
  onlyFile,
  toInt,
} from "../utils/detailsformat";

export default function useCenterRows(
  statistics,
  effectiveCenterId,
  dateFilter
) {
  const allRowsForCenter = useMemo(() => {
    const filtered = (statistics || []).filter((r) => {
      if (!effectiveCenterId) return true;
      const byField =
        r.center_id && String(r.center_id) === String(effectiveCenterId);
      const byPhotoPrefix =
        r.photo_name &&
        String(r.photo_name).includes("___") &&
        String(r.photo_name).startsWith(String(effectiveCenterId));
      return byField || byPhotoPrefix;
    });

    return filtered
      .map((r) => {
        const date = normalizeDate(r.date);
        const hour = normalizeHour(r.hour);
        const photo = onlyFile(r.photo_name);
        const seats = toInt(r.seats_occupied);
        const movie = r.movie_name || "—";
        const sortKey =
          new Date(`${date}T${hour || "00:00:00"}`).getTime() || 0;
        const photoKey = r.photo_name || "";
        return { photo, photoKey, seats, movie, date, hour, sortKey };
      })
      .sort((a, b) => b.sortKey - a.sortKey);
  }, [statistics, effectiveCenterId]);

  const filteredRowsByDate = useMemo(() => {
    const { from, to } = dateFilter || {};
    if (!from || !to) return allRowsForCenter;
    return allRowsForCenter.filter((r) => {
      if (!r.date) return false;
      const [y, m, d] = r.date.split("-").map(Number);
      const ms = Date.UTC(y, (m || 1) - 1, d || 1);
      return ms >= from && ms <= to;
    });
  }, [allRowsForCenter, dateFilter]);

  return { allRowsForCenter, filteredRowsByDate };
}
