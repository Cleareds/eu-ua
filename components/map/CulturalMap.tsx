"use client";

import { useEffect, useRef, useState } from "react";
import { City } from "@/lib/types";
import CityPanel from "./CityPanel";
import citiesData from "@/data/cities.json";

export default function CulturalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("maplibre-gl").Map | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglError, setWebglError] = useState(false);

  const cities = citiesData as City[];

  useEffect(() => {
    let map: import("maplibre-gl").Map;

    async function initMap() {
      if (!mapRef.current || mapInstance.current) return;

      try {
        const maplibregl = (await import("maplibre-gl")).default;

        map = new maplibregl.Map({
          container: mapRef.current,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [31.5, 48.5],
          zoom: 5.5,
        });

        mapInstance.current = map;

        map.on("error", (e) => {
          const msg = e.error?.message ?? "";
          // Only fall back on fatal WebGL initialisation failure, not tile/network errors
          if (msg.includes("Failed to initialize WebGL") || msg.includes("WebGL context")) {
            setWebglError(true);
            map.remove();
            mapInstance.current = null;
          }
        });

        map.on("load", () => {
          setMapLoaded(true);

          cities.forEach((city) => {
            const el = document.createElement("div");
            el.style.cssText = `
              width: 36px; height: 36px; border-radius: 50%;
              background-color: #003399; border: 3px solid #FFD700;
              cursor: pointer; display: flex; align-items: center;
              justify-content: center; color: white; font-weight: bold;
              font-size: 11px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              transition: transform 0.2s;
            `;
            el.textContent = city.name.slice(0, 2).toUpperCase();
            el.title = city.name;

            el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.2)"; });
            el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });
            el.addEventListener("click", () => {
              setSelectedCity(city);
              map.flyTo({ center: [city.lng, city.lat], zoom: 7, duration: 800 });
            });

            new maplibregl.Marker({ element: el }).setLngLat([city.lng, city.lat]).addTo(map);
          });
        });
      } catch {
        setWebglError(true);
      }
    }

    initMap();

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Fallback grid when WebGL isn't available
  if (webglError) {
    return (
      <div className="flex h-full">
        <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "#F8F9FA" }}>
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 p-4 rounded-xl border text-sm" style={{ backgroundColor: "#FEF3C7", borderColor: "#FDE68A", color: "#92400E" }}>
              <span className="font-semibold">Interactive map unavailable</span> — your browser or environment doesn't support WebGL. Showing city cards instead.
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => setSelectedCity(city)}
                  className="text-left p-5 bg-white rounded-2xl border hover:border-blue-300 hover:shadow-md transition-all"
                  style={selectedCity?.id === city.id ? { borderColor: "#003399", backgroundColor: "#EFF6FF" } : { borderColor: "#E5E7EB" }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mb-3"
                    style={{ backgroundColor: "#003399" }}>
                    {city.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h3 className="font-bold mb-1" style={{ color: "#1A1A2E" }}>{city.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-3">{city.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {selectedCity && (
          <div className="w-80 xl:w-96 border-l border-gray-200 bg-white shadow-xl overflow-hidden flex-shrink-0">
            <CityPanel city={selectedCity} onClose={() => setSelectedCity(null)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {mapLoaded && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 max-w-xs">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
              Cultural Cities
            </p>
            <div className="space-y-1">
              {cities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setSelectedCity(city);
                    mapInstance.current?.flyTo({ center: [city.lng, city.lat], zoom: 7, duration: 800 });
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
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
