import React, { memo, useState, useMemo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import useDashboardData from "../hooks/useDashboardData";
import useBaseTables from "../hooks/useBaseTables";


const geoUrl = "/maps/custom.geo.json";

const WorldMap = ({ onSelectCountry }) => {
  const { validCountries } = useBaseTables(); 
  const { countriesWithCenters } = useDashboardData();

  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = (geo) => {
    const countryName = geo.properties.name;
    console.log("✅ Clicked on country (map):", countryName);
    onSelectCountry(countryName);
  };

  const countriesToShow = useMemo(() => {
    return validCountries.filter((c) =>
      countriesWithCenters.includes(c.name)
    );
  }, [validCountries, countriesWithCenters]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160 }}
        width={980}
        height={440}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1} minZoom={1} maxZoom={8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(geo)}
                  onMouseEnter={() => {
                    setHoveredCountry(geo.properties.name);
                    setIsHovering(true);
                  }}
                  onMouseLeave={() => {
                    setIsHovering(false);
                    setTimeout(() => {
                      setHoveredCountry((prev) => (isHovering ? prev : null));
                    }, 100);
                  }}
                  style={{
                    default: {
                      fill: "#1E3A8A",
                      stroke: "#93C5FD",
                      strokeWidth: 0.4,
                      outline: "none",
                    },
                    hover: {
                      fill: "#0EA5E9",
                      stroke: "#fff",
                      strokeWidth: 0.5,
                      cursor: "pointer",
                      outline: "none",
                    },
                    pressed: {
                      fill: "#38BDF8",
                      outline: "none",
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {hoveredCountry && (() => {
            const found = validCountries.find((c) => c.name === hoveredCountry);
            return found ? (
              <Marker coordinates={found.coordinates}>
                <text
                  textAnchor="middle"
                  y={-12}
                  fontSize={12}
                  fontWeight={600}
                  fill="#ffffff"
                  style={{
                    pointerEvents: "none",
                    textShadow: "0 0 4px rgba(0,0,0,0.5)",
                  }}
                >
                  {found.name}
                </text>
              </Marker>
            ) : null;
          })()}

          {countriesToShow.map((c) => (
            <Marker key={c.name} coordinates={c.coordinates}>
              <circle
                r={3}
                fill="#f43f5e"
                stroke="#fff"
                strokeWidth={1}
                onClick={() => {
                  console.log("📍 Clicked on country (pin):", c.name);
                  onSelectCountry(c.name);
                }}
                onMouseEnter={() => {
                  setHoveredCountry(c.name);
                  setIsHovering(true);
                }}
                onMouseLeave={() => {
                  setIsHovering(false);
                  setTimeout(() => {
                    setHoveredCountry((prev) => (isHovering ? prev : null));
                  }, 100);
                }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);
