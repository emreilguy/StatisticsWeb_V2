import { useMemo } from 'react';
import { createPicker } from '../utils/dashboardFunctions';
import { countriesData } from '../constants/data';

export default function useNameMaps({ city, country, region }) {
  // city: id -> name and name -> name
  const cityNameMap = useMemo(() => {
    const map = new Map();
    (city || []).forEach((row) => {
      const pick = createPicker(row);
      const id = (pick('id', 'uuid', 'guid', 'city_id', 'CityId', 'ID') || '').toString().trim().toLowerCase();
      const name = pick('name', 'city_name', 'CityName', 'city');
      if (id && name) map.set(id, name);
      const nameKey = (name || '').toString().trim().toLowerCase();
      if (nameKey) map.set(nameKey, name);
    });
    return map;
  }, [city]);

  // name -> cityId
  const cityNameToId = useMemo(() => {
    const map = new Map();
    (city || []).forEach((row) => {
      const pick = createPicker(row);
      const id = (pick('id', 'uuid', 'guid', 'city_id', 'CityId', 'ID') || '').toString().trim().toLowerCase();
      const name = (pick('name', 'city_name', 'CityName', 'city') || '').toString().trim().toLowerCase();
      if (id && name) map.set(name, id);
    });
    return map;
  }, [city]);

  // cityId -> countryId
  const cityIdToCountryId = useMemo(() => {
    const map = new Map();
    (city || []).forEach((row) => {
      const pick = createPicker(row);
      const id = (pick('id', 'uuid', 'guid', 'city_id', 'CityId', 'ID') || '').toString().trim().toLowerCase();
      const countryId = (pick('country_id', 'CountryId', 'country_uuid', 'country') || '').toString().trim().toLowerCase();
      if (id && countryId) map.set(id, countryId);
    });
    return map;
  }, [city]);

  // country: id/code/name -> name
  const countryNameMap = useMemo(() => {
    const map = new Map();
    (country || []).forEach((row) => {
      const pick = createPicker(row);
      const primaryId = (pick('id', 'uuid', 'guid', 'country_id', 'CountryId', 'ID') || '').toString().trim().toLowerCase();
      const name = pick('name', 'country_name', 'CountryName', 'country');
      if (primaryId && name) map.set(primaryId, name);

      const code2 = (pick('code', 'iso2', 'ISO2', 'alpha2') || '').toString().trim().toLowerCase();
      const code3 = (pick('iso3', 'ISO3', 'alpha3') || '').toString().trim().toLowerCase();
      if (code2 && name) map.set(code2, name);
      if (code3 && name) map.set(code3, name);

      const nameKey = (name || '').toString().trim().toLowerCase();
      if (nameKey) map.set(nameKey, name);
    });
    return map;
  }, [country]);

  // region: id/name -> name
  const regionNameMap = useMemo(() => {
    const map = new Map();
    (region || []).forEach((row) => {
      const pick = createPicker(row);
      const primaryId = (pick('id', 'uuid', 'guid', 'region_id', 'RegionId', 'ID') || '').toString().trim().toLowerCase();
      const name = pick('name', 'region_name', 'RegionName', 'region');
      if (primaryId && name) map.set(primaryId, name);

      const nameKey = (name || '').toString().trim().toLowerCase();
      if (nameKey) map.set(nameKey, name);
    });
    return map;
  }, [region]);

  // countryId -> regionId (from db_country)
  const countryIdToRegionId = useMemo(() => {
    const map = new Map();
    (country || []).forEach((row) => {
      const pick = createPicker(row);
      const cid = (pick('id', 'uuid', 'guid', 'country_id', 'CountryId', 'ID') || '').toString().trim().toLowerCase();
      const rid = (pick('region_id', 'RegionId', 'region_uuid', 'region') || '').toString().trim().toLowerCase();
      if (cid && rid) map.set(cid, rid);
    });
    return map;
  }, [country]);

  // Static fallback map from constants
  const countryMap = useMemo(() => {
    const map = new Map();
    (countriesData || []).forEach((c) => {
      const name = c.name ?? c.country ?? c.label ?? c.text ?? '';
      const id = String(c.id ?? c.value ?? '').trim().toLowerCase();
      const code = String(c.code ?? c.iso2 ?? c.iso3 ?? '').trim().toLowerCase();
      if (id) map.set(id, name);
      if (code) map.set(code, name);
      if (name) map.set(name.toLowerCase(), name);
    });
    return map;
  }, []);

  return useMemo(() => ({
    cityNameMap,
    countryNameMap,
    regionNameMap,
    countryMap,
    cityNameToId,
    cityIdToCountryId,
    countryIdToRegionId,
  }), [
    cityNameMap,
    countryNameMap,
    regionNameMap,
    countryMap,
    cityNameToId,
    cityIdToCountryId,
    countryIdToRegionId,
  ]);

}
