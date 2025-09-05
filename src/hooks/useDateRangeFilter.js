// src/hooks/useDateRangeFilter.js
import { useEffect, useState } from "react";

export default function useDateRangeFilter() {
  const [rangeUI, setRangeUI] = useState({ from: null, to: null });
  const [dateFilter, setDateFilter] = useState({ from: null, to: null });

  const toUtcMs = (d) => (d ? Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) : null);

  useEffect(() => {
    const from = toUtcMs(rangeUI?.from);
    const to = toUtcMs(rangeUI?.to);
    if (from && to) {
      const normalized = from <= to ? { from, to } : { from: to, to: from };
      setDateFilter(normalized);
    } else {
      setDateFilter({ from: null, to: null });
    }
  }, [rangeUI]);

  return { rangeUI, setRangeUI, dateFilter };
}
