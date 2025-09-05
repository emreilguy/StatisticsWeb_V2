// Pure helpers (no React inside)

export const normKey = (k) =>
  String(k || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

export const createPicker = (raw) => {
  const index = {};
  for (const k of Object.keys(raw || {})) index[normKey(k)] = k;

  const pickExact = (...variants) => {
    for (const v of variants) {
      const real = index[normKey(v)];
      if (real != null) {
        const val = raw[real];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
    return "";
  };

  const pickFuzzy = (...variants) => {
    for (const v of variants) {
      const nv = normKey(v);
      const hit = Object.keys(index).find((nk) => nk.includes(nv));
      if (hit) {
        const val = raw[index[hit]];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          return String(val).trim();
        }
      }
    }
    return "";
  };

  const pick = (...variants) =>
    pickExact(...variants) || pickFuzzy(...variants);
  pick.strict = (...variants) => pickExact(...variants);
  return pick;
};

export const looksLikeUUID = (s) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );

export const parseStatDate = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split(".").map((n) => parseInt(n, 10));
  const [hh = 0, mm = 0, ss = 0] = (timeStr || "")
    .split(".")
    .map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, hh || 0, mm || 0, ss || 0);
  return isNaN(dt.getTime()) ? null : dt;
};

export const safeFav = (movieCounts) => {
  const data = movieCounts || {};
  const names = Object.keys(data);
  if (!names.length) return "No";
  return names.reduce((a, b) => (data[a] >= data[b] ? a : b));
};

export const getModeName = (rows = [], key = "region") => {
  const counts = new Map();
  for (const r of rows) {
    const name = (r[key] || "").toString().trim();
    if (!name || name === "—") continue;
    counts.set(name, (counts.get(name) || 0) + 1);
  }
  let winner = "—";
  let max = -1;
  for (const [name, cnt] of counts) {
    if (cnt > max) {
      winner = name;
      max = cnt;
    }
  }
  return winner;
};

export const normalizeCenters = (arr = []) =>
  arr.map((c) => {
    const raw = c || {};
    const pick = createPicker(raw);
    const visibleRaw = pick("visible", "is_visible", "Visible", "VIS")
      ?.toString()
      .toLowerCase();

    return {
      _raw: raw,
      id: pick(
        "id",
        "uuid",
        "guid",
        "ID",
        "Id",
        "center_id",
        "CenterId",
        "Center ID",
        "CENTER_ID"
      ),
      region: pick(
        "Region",
        "Region Name",
        "REGION",
        "Bolge",
        "Bölge",
        "region_id",
        "RegionId",
        "Region ID"
      ),
      country: pick(
        "Country",
        "Country Name",
        "COUNTRY",
        "Ulke",
        "Ülke",
        "country_id",
        "CountryId",
        "Country ID"
      ),
      city: pick(
        "City",
        "City Name",
        "CITY",
        "Sehir",
        "Şehir",
        "city_id",
        "CityId",
        "City ID"
      ),
      centerName: pick(
        "Centers",
        "Center Name",
        "center_name",
        "CENTER_NAME",
        "Center",
        "name",
        "Names",
        "Branch Name",
        "Location Name"
      ),
      projectCode: pick(
        "project_code",
        "ProjectCode",
        "PROJECT_CODE",
        "project",
        "Project Code"
      ),
      lastDate: pick(
        "last_date",
        "lastDate",
        "LastDate",
        "Last Date",
        "LastUpdate",
        "UpdatedAt",
        "Last_Updated"
      ),
      visible:
        visibleRaw === "true" || visibleRaw === "1" || visibleRaw === "yes",
    };
  });

export const normalizeStats = (arr = []) =>
  arr.map((s) => {
    const raw = s || {};
    const pick = createPicker(raw);
    const seatsRaw = pick("seats_occupied", "Seats", "seats") || 0;
    const seatsNum = Number.isFinite(parseInt(seatsRaw, 10))
      ? parseInt(seatsRaw, 10)
      : 0;

    return {
      ...raw,
      center_id: pick(
        "center_id",
        "centerId",
        "CenterId",
        "Center ID",
        "CENTER_ID"
      ),
      seats_occupied: seatsNum,
      movie_name: pick("movie_name", "MovieName", "MOVIE_NAME"),
      date: pick("date", "Date", "DATE"),
      hour: pick("hour", "Hour", "HOUR", "time", "Time", "TIME"),
    };
  });

export const resolveFromDicts = (raw, dict, fallbackMap) => {
  const s = String(raw || "").trim();
  if (!s) return "—";
  const k = s.toLowerCase();
  if (dict && dict.get(k)) return dict.get(k);
  if (fallbackMap && fallbackMap.get(k)) return fallbackMap.get(k);
  return looksLikeUUID(s) ? "—" : s;
};
