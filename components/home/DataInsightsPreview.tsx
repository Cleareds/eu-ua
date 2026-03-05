import Link from "next/link";
import type { EUUkraineData } from "@/lib/types";

function MiniStat({ label, value, change, color }: { label: string; value: string; change: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{label}</div>
      <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-xs text-green-600 font-medium">{change}</div>
    </div>
  );
}

export default function DataInsightsPreview({ data }: { data: EUUkraineData }) {
  const lastTrade = data.tradeShare[data.tradeShare.length - 1];
  const lastStudents = data.students[data.students.length - 1];
  const lastAssist = data.assistance[data.assistance.length - 1];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Integration in Numbers</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          The data tells a clear story: Ukraine and the EU are deeply and increasingly intertwined.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <MiniStat label={`EU Share of Ukraine Exports (${lastTrade.year})`} value={`${lastTrade.value}%`} change="↑ from 26% in 2013 — Eurostat" color="#003399" />
        <MiniStat label={`Ukrainian Students in EU (${lastStudents.year})`} value={`${(lastStudents.value / 1000).toFixed(0)}K`} change="↑ 10× increase since 2015 — UNESCO/UNHCR" color="#003399" />
        <MiniStat label={`EU Financial Support (${lastAssist.year})`} value={`€${lastAssist.value}B`} change="↑ Ukraine Facility + MFA — EC" color="#003399" />
      </div>

      <div className="text-center">
        <Link href="/data-dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90" style={{ backgroundColor: "#003399", color: "white" }}>
          View Full Data Dashboard with Sources →
        </Link>
      </div>
    </section>
  );
}
