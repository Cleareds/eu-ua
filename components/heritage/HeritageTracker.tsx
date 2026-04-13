"use client";

import { useState } from "react";
import culturalSitesData from "@/data/cultural-sites.json";
import { CulturalSite, SiteDamage } from "@/lib/types";
import { ExternalLink } from "lucide-react";
import { DAMAGE_CONFIG } from "@/lib/constants";

const sites = culturalSitesData as CulturalSite[];

const TYPE_OPTIONS = ["All", ...Array.from(new Set(sites.map((s) => s.type))).sort()];
const DAMAGE_OPTIONS: Array<"all" | SiteDamage> = ["all", "destroyed", "severely_damaged", "damaged"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function HeritageTracker() {
  const [damageFilter, setDamageFilter] = useState<"all" | SiteDamage>("all");
  const [typeFilter, setTypeFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sites.filter((s) => {
    const matchDamage = damageFilter === "all" || s.damage === damageFilter;
    const matchType = typeFilter === "All" || s.type === typeFilter;
    return matchDamage && matchType;
  });

  const stats = {
    destroyed: sites.filter((s) => s.damage === "destroyed").length,
    severely_damaged: sites.filter((s) => s.damage === "severely_damaged").length,
    damaged: sites.filter((s) => s.damage === "damaged").length,
  };

  return (
    <>
      {/* Header */}
      <div className="py-14 px-4 text-white" style={{ backgroundColor: "#7f0000" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-75">Cultural Heritage Damage Tracker</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ukraine&apos;s Destroyed Heritage</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            Documented attacks on Ukrainian cultural heritage since February 2022 — theatres, museums, universities, monasteries, and historic districts.
          </p>
        </div>

        {/* Stats row */}
        <div className="max-w-xl mx-auto mt-8 grid grid-cols-3 gap-4">
          {(["destroyed", "severely_damaged", "damaged"] as SiteDamage[]).map((level) => (
            <button
              key={level}
              onClick={() => setDamageFilter(damageFilter === level ? "all" : level)}
              className="rounded-xl p-4 text-center transition-transform hover:scale-105"
              style={{
                backgroundColor: damageFilter === level ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
                border: damageFilter === level ? "2px solid rgba(255,255,255,0.6)" : "2px solid transparent",
              }}
            >
              <div className="text-2xl font-bold">{stats[level]}</div>
              <div className="text-xs opacity-75 mt-0.5">{DAMAGE_CONFIG[level].label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex flex-wrap gap-2">
            {DAMAGE_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDamageFilter(d)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={
                  damageFilter === d
                    ? { backgroundColor: "#7f0000", color: "white", borderColor: "#7f0000" }
                    : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {d === "all" ? "All Damage" : DAMAGE_CONFIG[d as SiteDamage].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                style={
                  typeFilter === t
                    ? { backgroundColor: "#1A1A2E", color: "white", borderColor: "#1A1A2E" }
                    : { backgroundColor: "white", color: "#6B7280", borderColor: "#E5E7EB" }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-gray-500 mb-5">
          Showing {filtered.length} of {sites.length} documented sites
        </p>

        {/* Site cards */}
        <div className="space-y-4">
          {filtered.map((site) => {
            const cfg = DAMAGE_CONFIG[site.damage];
            const isExpanded = expandedId === site.id;
            return (
              <div
                key={site.id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderColor: isExpanded ? cfg.dot : "#E5E7EB" }}
                onClick={() => setExpandedId(isExpanded ? null : site.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        <span className="text-xs text-gray-500">{site.type}</span>
                        <span className="text-xs text-gray-400">{site.city}</span>
                        <span className="text-xs text-gray-400">{formatDate(site.date)}</span>
                      </div>
                      <h3 className="font-bold text-sm leading-snug" style={{ color: "#1A1A2E" }}>{site.name}</h3>
                    </div>
                    <div className="w-3 h-3 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: cfg.dot }} />
                  </div>

                  {isExpanded && site.image && (
                    <div className="mt-3 w-full h-40 rounded-lg overflow-hidden">
                      <img src={site.image} alt={site.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className={`text-sm text-gray-600 leading-relaxed mt-2 ${isExpanded ? "" : "line-clamp-2"}`}>
                    {site.description}
                  </p>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 border-t pt-4" style={{ borderColor: "#F3F4F6" }}>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6B7280" }}>
                      Sources & Documentation
                    </h4>
                    <ul className="space-y-1.5">
                      {site.sources.map((source) => (
                        <li key={source.url}>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1.5 text-xs hover:underline"
                            style={{ color: "#7f0000" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 mt-0.5 shrink-0" />
                            <span>{source.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 p-4 rounded-xl border text-xs text-gray-500 leading-relaxed" style={{ borderColor: "#E5E7EB", backgroundColor: "white" }}>
          <strong>Data sources:</strong> UNESCO, ICOMOS, AP, Human Rights Watch, The Art Newspaper, Wikipedia, and local Ukrainian institutions.
          This tracker documents selected significant incidents — the full scale of cultural heritage damage is substantially larger.
          As of early 2025, UNESCO has verified damage to over 350 cultural sites in Ukraine.
        </div>
      </div>
    </>
  );
}
