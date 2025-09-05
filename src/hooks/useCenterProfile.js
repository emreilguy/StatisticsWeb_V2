// src/hooks/useCenterProfile.js
import { useEffect, useMemo, useState } from "react";
import { ReadTable } from "../constants/AwsUtils";

const TABLE = "db_statistics_customers";

export default function useCenterProfile(centerId) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(Boolean(centerId));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!centerId) return;
      setLoading(true);
      setError(null);
      try {
        const items = await ReadTable(TABLE);
        const matches = (items || []).filter(
          (it) => String(it.center_id || "") === String(centerId)
        );
        if (!cancelled) setData(matches);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [centerId]);

  const profile = useMemo(() => {
    if (!data || !data.length) return null;

    const row = data[0];

    const ownerName =
      row?.name ||
      row?.owner_name ||
      row?.full_name ||
      row?.contact_name ||
      null;

    const centerName =
      row?.center_name ||
      row?.centerTitle ||
      row?.center ||
      null;

    const email =
      row?.email ||
      row?.owner_email ||
      row?.contact_email ||
      null;

    const phone =
      row?.phone_number ||
      row?.phone ||
      row?.owner_phone ||
      null;

    // Single machine
    const machineName =
      row?.machine_name ||
      row?.machine ||
      row?.machineName ||
      null;

    return {
      centerId,
      centerName,
      ownerName,
      email,
      phone,
      machineName,
      raw: data,
    };
  }, [data, centerId]);

  return { profile, isLoading, error };
}
