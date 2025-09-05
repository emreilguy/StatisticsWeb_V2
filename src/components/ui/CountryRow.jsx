const CountryRow = ({ country, flag, totalCases, newCases, totalDeaths, deathRate, recovered, active, status }) => (
  <tr className="hover:bg-white hover:bg-opacity-5 transform transition-all duration-300 hover:scale-105">
    <td className="px-6 py-4">
      <span className="mr-3">{flag}</span>
      {country}
    </td>
    <td className="px-6 py-4">{totalCases?.toLocaleString() ?? '—'}</td>
    <td className="px-6 py-4 text-red-400">+{newCases?.toLocaleString() ?? '—'}</td>
    <td className="px-6 py-4">{totalDeaths?.toLocaleString() ?? '—'}</td>
    <td className="px-6 py-4">{deathRate ?? '—'}</td>
    <td className="px-6 py-4 text-teal-400">{recovered?.toLocaleString() ?? '—'}</td>
    <td className="px-6 py-4">{active?.toLocaleString() ?? '—'}</td>

  </tr>
);
export default CountryRow;
