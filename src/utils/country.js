// src/utils/country.js
export function normalizeCountryName(name) {
  const mapping = {
    "United States of America": "United States",
    USA: "United States",
    Türkiye: "Turkey",
    "Republic of Turkey": "Turkey",
  };
  const cleaned = (name || "").trim().toLowerCase();
  for (const key in mapping) {
    if (cleaned === key.trim().toLowerCase()) {
      return mapping[key].toLowerCase();
    }
  }
  return cleaned;
}

export function buildCenterIdToCountryName({ location, city, country }) {
  if (!location?.length || !city?.length || !country?.length) return new Map();
  const cityIdToCountryId = new Map(
    city.map((ci) => [String(ci.id), String(ci.country_id)])
  );
  const countryIdToName = new Map(
    country.map((co) => [String(co.id), String(co.name)])
  );

  const map = new Map();
  for (const c of location) {
    const cityId = String(c.city_id || "");
    const countryId = cityIdToCountryId.get(cityId);
    const countryName = countryId
      ? countryIdToName.get(String(countryId))
      : null;
    if (countryName) {
      map.set(String(c.id), countryName);
    }
  }
  return map;
}
