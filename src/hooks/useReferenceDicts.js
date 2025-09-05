import { useEffect, useState } from 'react';
import { ReadTable } from '../constants/AwsUtils';
import { createPicker } from '../utils/dashboardFunctions';


export default function useReferenceDicts() {
  const [countryDict, setCountryDict] = useState(new Map());
  const [cityDict, setCityDict] = useState(new Map());
  const [regionDict, setRegionDict] = useState(new Map());

  useEffect(() => {
const loaders = [
  {
    table: 'db_country',
    setter: setCountryDict,
    idKeys: ['id', 'uuid', 'guid', 'country_id', 'CountryId', 'ID', 'code', 'iso2', 'iso3'],
    nameKeys: ['name', 'country_name', 'CountryName', 'country'],
  },
  {
    table: 'db_city',
    setter: setCityDict,
    idKeys: ['id', 'uuid', 'guid', 'city_id', 'CityId', 'ID'],
    nameKeys: ['name', 'city_name', 'CityName', 'city'],
  },
  {
    table: 'db_region',
    setter: setRegionDict,
    idKeys: ['id', 'uuid', 'guid', 'region_id', 'RegionId', 'ID'],
    nameKeys: ['name', 'region_name', 'RegionName', 'region'],
  },
];


    loaders.forEach(async ({ table, setter, idKeys, nameKeys }) => {
      try {
        const data = await ReadTable(table);
        const map = new Map();
        (data || []).forEach((row) => {
          const pick = createPicker(row);
          const id = (pick(...idKeys) || '').toString().trim().toLowerCase();
          const name = pick(...nameKeys);
          if (id && name) map.set(id, name);
        });
        setter(map);
      } catch (e) {
        console.warn(`${table} optional load failed:`, e?.message || e);
      }
    });
  }, []);

  return { countryDict, cityDict, regionDict };
}
