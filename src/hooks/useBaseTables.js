import { useEffect, useState, useMemo } from 'react';
import { ReadTable } from '../constants/AwsUtils';

export default function useBaseTables() {
  const [statistics, setStatistics] = useState([]);
  const [location, setLocation] = useState([]);
  const [region, setRegion] = useState([]);
  const [country, setCountry] = useState([]);
  const [city, setCity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const [st, ct, rg, co, ci, us] = await Promise.all([
          ReadTable('db_statistics'),
          ReadTable('db_centers'),
          ReadTable('db_region'),
          ReadTable('db_country'),
          ReadTable('db_city'),
          ReadTable('db_users'),
        ]);
        if (!alive) return;
        setStatistics(st || []);
        setLocation(ct || []);
        setRegion(rg || []);
        setCountry(co || []);
        setCity(ci || []);
        setUsers(us || []);
      } catch (e) {
        console.error('Base tables load error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, []);

  const validCountries = useMemo(() => {
    return country
      .map((c) => {
        let coords = [];
        try {
          if (typeof c.coordinates === "string") {
            coords = JSON.parse(c.coordinates);
            if (!Array.isArray(coords)) throw new Error("Not array");
            if (coords.length !== 2) throw new Error("Invalid length");
            if (typeof coords[0] !== "number" || typeof coords[1] !== "number")
              throw new Error("Invalid numbers");
          }
        } catch (e) {
          console.warn("Invalid coordinates for country:", c.name);
          return null;
        }
        return { ...c, coordinates: coords };
      })
      .filter(Boolean);
  }, [country]);

  const countriesWithCenters = useMemo(() => {
    const all = location.map((loc) => loc.country).filter(Boolean);
    const unique = Array.from(new Set(all));
    return unique;
  }, [location]);

  return {
    statistics,
    location,
    region,
    country,
    city,
    users,
    loading,
    validCountries,
    countriesWithCenters, 
  };
}
