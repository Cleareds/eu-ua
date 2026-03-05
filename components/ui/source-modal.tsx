"use client";

import { useState } from "react";

interface Source {
  label: string;
  url: string;
  description?: string;
}

interface Props {
  title: string;
  sources: Source[];
  note?: string;
}

export default function SourceModal({ title, sources, note }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
        style={{ color: "#003399" }}
        title="View data sources"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sources
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#003399" }}>Data Sources</div>
                <h3 className="font-bold text-base" style={{ color: "#1A1A2E" }}>{title}</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none mt-0.5">×</button>
            </div>

            {/* Disclaimer */}
            <div className="mb-4 p-3 rounded-lg text-xs" style={{ backgroundColor: "#F0F4FF", color: "#374151" }}>
              <span className="font-semibold">Independent initiative.</span> This platform is not affiliated with any government, EU institution, or official body. All data is aggregated from publicly available sources.
            </div>

            {/* Sources */}
            <ul className="space-y-3">
              {sources.map((s) => (
                <li key={s.url} className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5" style={{ color: "#003399" }}>↗</span>
                  <div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline"
                      style={{ color: "#003399" }}
                    >
                      {s.label}
                    </a>
                    {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                  </div>
                </li>
              ))}
            </ul>

            {note && (
              <p className="mt-4 text-xs text-gray-400 border-t pt-3">{note}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
