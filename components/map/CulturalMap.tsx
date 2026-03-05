"use client";

import { useEffect, useRef, useState } from "react";
import { City } from "@/lib/types";
import CityPanel from "./CityPanel";
import citiesData from "@/data/cities.json";

export default function CulturalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const cities = citiesData as City[];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current!, {
        center: [48.5, 31.5],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;

      cities.forEach((city) => {
        const icon = L.divIcon({
          html: `<div class="city-pin">${city.name.slice(0, 2).toUpperCase()}</div>`,
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([city.lat, city.lng], { icon });
        marker.on("click", () => {
          setSelectedCity(city);
          map.flyTo([city.lat, city.lng], 7, { duration: 0.8 });
        });
        marker.addTo(map);
      });

      setMapLoaded(true);
    }

    initMap().catch(console.error);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100" style={{ zIndex: 1000 }}>
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {mapLoaded && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs" style={{ zIndex: 1000 }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
              Cultural Cities
            </p>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    mapInstance.current?.flyTo([city.lat, city.lng], 7, { duration: 0.8 });
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                  style={selectedCity?.id === city.id ? { backgroundColor: "#EFF6FF", color: "#003399", fontWeight: 600 } : { color: "#1A1A2E" }}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedCity && (
        <div
          className="w-80 xl:w-96 border-l border-gray-200 bg-white shadow-xl overflow-hidden flex-shrink-0"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          <CityPanel city={selectedCity} onClose={() => setSelectedCity(null)} />
        </div>
      )}

      <style>{`
        .city-pin {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #003399;
          border: 3px solid #FFD700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 11px;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
          z-index: 1;
        }
        .city-pin:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 16px rgba(0,51,153,0.4);
          z-index: 9999 !important;
        }
        .leaflet-marker-icon {
          overflow: visible !important;
          background: none !important;
          border: none !important;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
