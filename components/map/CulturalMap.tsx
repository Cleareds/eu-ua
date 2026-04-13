"use client";

import { useEffect, useRef, useState } from "react";
import { City, CulturalSite } from "@/lib/types";
import CityPanel from "./CityPanel";
import CulturalSitePanel from "./CulturalSitePanel";
import citiesData from "@/data/cities.json";
import culturalSitesData from "@/data/cultural-sites.json";

type Selection =
  | { type: "city"; item: City }
  | { type: "site"; item: CulturalSite }
  | null;

function markerHTML(city: City) {
  const label = city.name.slice(0, 2).toUpperCase();
  if (city.status === "occupied") {
    return `<div class="city-pin city-pin--occupied" title="${city.name}">${label}</div>`;
  }
  if (city.status === "liberated") {
    return `<div class="city-pin city-pin--liberated" title="${city.name}">${label}</div>`;
  }
  return `<div class="city-pin" title="${city.name}">${label}</div>`;
}

function siteMarkerHTML(site: CulturalSite) {
  const icon = site.damage === "destroyed" ? "✕" : "!";
  const cls = site.damage === "destroyed" ? "site-pin site-pin--destroyed" : "site-pin site-pin--damaged";
  return `<div class="${cls}" title="${site.name}">${icon}</div>`;
}

export default function CulturalMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<import("leaflet").Map | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showSites, setShowSites] = useState(true);
  const [legendOpen, setLegendOpen] = useState(false);

  const cities = citiesData as City[];
  const culturalSites = culturalSitesData as CulturalSite[];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function initMap() {
      const L = (await import("leaflet")).default;

      const map = L.map(mapRef.current!, {
        center: [48.0, 32.0],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;

      // City markers
      cities.forEach((city) => {
        const icon = L.divIcon({
          html: markerHTML(city),
          className: "",
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = L.marker([city.lat, city.lng], { icon });
        marker.on("click", () => {
          setSelection({ type: "city", item: city });
          map.flyTo([city.lat, city.lng], Math.max(map.getZoom(), 7), { duration: 0.8 });
        });
        marker.addTo(map);
      });

      // Cultural damage markers
      culturalSites.forEach((site) => {
        const icon = L.divIcon({
          html: siteMarkerHTML(site),
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([site.lat, site.lng], { icon });
        marker.on("click", () => {
          setSelection({ type: "site", item: site });
          map.flyTo([site.lat, site.lng], Math.max(map.getZoom(), 9), { duration: 0.8 });
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

  const freeCities = cities.filter((c) => !c.status || c.status === "free");
  const occupiedCities = cities.filter((c) => c.status === "occupied");
  const liberatedCities = cities.filter((c) => c.status === "liberated");

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
          <>
          {/* Toggle button – mobile only, hidden when a city/site is selected */}
          {!selection && (
          <button
            onClick={() => setLegendOpen((v) => !v)}
            className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest md:hidden"
            style={{ zIndex: 1001, color: "#003399" }}
            aria-label={legendOpen ? "Close legend" : "Open legend"}
          >
            {legendOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            )}
            {!legendOpen && "Legend"}
          </button>
          )}
          <div
            className={`absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 w-56 transition-all duration-200 ${legendOpen && !selection ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0 pointer-events-none"} ${selection ? "md:hidden" : "md:translate-x-0 md:opacity-100 md:pointer-events-auto"}`}
            style={{ zIndex: 1000 }}
          >
            {/* Close button – mobile only */}
            <button
              onClick={() => setLegendOpen(false)}
              className="absolute top-2 right-2 p-1 rounded-lg hover:bg-gray-100 md:hidden"
              aria-label="Close legend"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {/* Legend */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>Legend</p>
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex items-center gap-2">
                <span className="city-pin-legend city-pin-legend--free" />
                <span className="text-gray-700">Ukrainian city</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="city-pin-legend city-pin-legend--liberated" />
                <span className="text-gray-700">Liberated city</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="city-pin-legend city-pin-legend--occupied" />
                <span className="text-gray-700">Occupied territory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="site-pin-legend site-pin-legend--destroyed" />
                <span className="text-gray-700">Destroyed cultural site</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="site-pin-legend site-pin-legend--damaged" />
                <span className="text-gray-700">Damaged cultural site</span>
              </div>
            </div>

            {/* City lists */}
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#003399" }}>Cities</p>
            <div className="space-y-0.5 max-h-[40vh] overflow-y-auto">
              {freeCities.map((city) => (
                <CityButton key={city.id} city={city} selection={selection} onClick={() => {
                  setSelection({ type: "city", item: city });
                  mapInstance.current?.flyTo([city.lat, city.lng], Math.max(mapInstance.current.getZoom(), 7), { duration: 0.8 });
                }} />
              ))}
              {liberatedCities.length > 0 && (
                <p className="text-xs font-medium pt-1.5 pb-0.5" style={{ color: "#b45309" }}>Liberated</p>
              )}
              {liberatedCities.map((city) => (
                <CityButton key={city.id} city={city} selection={selection} onClick={() => {
                  setSelection({ type: "city", item: city });
                  mapInstance.current?.flyTo([city.lat, city.lng], Math.max(mapInstance.current.getZoom(), 7), { duration: 0.8 });
                }} />
              ))}
              {occupiedCities.length > 0 && (
                <p className="text-xs font-medium pt-1.5 pb-0.5" style={{ color: "#cc0000" }}>Occupied</p>
              )}
              {occupiedCities.map((city) => (
                <CityButton key={city.id} city={city} selection={selection} onClick={() => {
                  setSelection({ type: "city", item: city });
                  mapInstance.current?.flyTo([city.lat, city.lng], Math.max(mapInstance.current.getZoom(), 7), { duration: 0.8 });
                }} />
              ))}
            </div>

            {/* Cultural sites toggle */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#cc0000" }}>Damaged Sites</p>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {culturalSites.map((site) => (
                  <button
                    key={site.id}
                    onClick={() => {
                      setSelection({ type: "site", item: site });
                      mapInstance.current?.flyTo([site.lat, site.lng], Math.max(mapInstance.current.getZoom(), 9), { duration: 0.8 });
                    }}
                    className="w-full text-left px-2 py-1 rounded text-xs hover:bg-red-50 transition-colors"
                    style={
                      selection?.type === "site" && selection.item.id === site.id
                        ? { backgroundColor: "#FEF2F2", color: "#cc0000", fontWeight: 600 }
                        : { color: "#374151" }
                    }
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          </>
        )}
      </div>

      {selection && (
        <div
          className="w-80 xl:w-96 border-l border-gray-200 bg-white shadow-xl overflow-hidden flex-shrink-0"
          style={{ animation: "slideIn 0.3s ease-out" }}
        >
          {selection.type === "city" ? (
            <CityPanel city={selection.item} onClose={() => setSelection(null)} onSelectSite={(site) => {
              setSelection({ type: "site", item: site });
              mapInstance.current?.flyTo([site.lat, site.lng], Math.max(mapInstance.current.getZoom(), 9), { duration: 0.8 });
            }} />
          ) : (
            <CulturalSitePanel site={selection.item} onClose={() => setSelection(null)} />
          )}
        </div>
      )}

      <style>{`
        /* City pins */
        .city-pin {
          width: 36px; height: 36px; border-radius: 50%;
          background-color: #003399; border: 3px solid #FFD700;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 11px; font-family: inherit;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative; z-index: 1;
        }
        .city-pin--occupied {
          background-color: #1a1a1a; border-color: #cc0000;
        }
        .city-pin--liberated {
          background-color: #003399; border-color: #f97316;
        }
        .city-pin:hover {
          transform: scale(1.25); box-shadow: 0 4px 16px rgba(0,51,153,0.4);
          z-index: 9999 !important;
        }
        /* Cultural damage pins */
        .site-pin {
          width: 28px; height: 28px; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 14px; font-family: inherit;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: transform 0.2s;
          position: relative; z-index: 2;
          border: 2px solid rgba(255,255,255,0.8);
        }
        .site-pin--destroyed {
          background-color: #cc0000; color: white;
        }
        .site-pin--damaged {
          background-color: #f97316; color: white;
        }
        .site-pin:hover {
          transform: scale(1.3); z-index: 9999 !important;
        }
        /* Legend swatches */
        .city-pin-legend {
          display: inline-block; width: 14px; height: 14px; border-radius: 50%;
          flex-shrink: 0; border: 2px solid;
        }
        .city-pin-legend--free { background: #003399; border-color: #FFD700; }
        .city-pin-legend--liberated { background: #003399; border-color: #f97316; }
        .city-pin-legend--occupied { background: #1a1a1a; border-color: #cc0000; }
        .site-pin-legend {
          display: inline-block; width: 12px; height: 12px; border-radius: 50%;
          flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.6);
        }
        .site-pin-legend--destroyed { background: #cc0000; }
        .site-pin-legend--damaged { background: #f97316; }
        /* Leaflet overrides */
        .leaflet-marker-icon { overflow: visible !important; background: none !important; border: none !important; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CityButton({ city, selection, onClick }: {
  city: City;
  selection: Selection;
  onClick: () => void;
}) {
  const active = selection?.type === "city" && selection.item.id === city.id;
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2 py-1 rounded text-xs hover:bg-blue-50 transition-colors"
      style={active ? { backgroundColor: "#EFF6FF", color: "#003399", fontWeight: 600 } : { color: "#374151" }}
    >
      {city.name}
    </button>
  );
}
