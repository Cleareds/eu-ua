"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import SourceModal from "@/components/ui/source-modal";
import type { TradeDataPoint } from "@/lib/types";

const sources = [
  { label: "European Commission — Ukraine Facility (€50B, 2024–2027)", url: "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine/ukraine-facility_en", description: "Official Ukraine Facility page — €26.8B disbursed by Dec 2025" },
  { label: "Council of the EU — EU financial assistance to Ukraine", url: "https://www.consilium.europa.eu/en/policies/ukraine-solidarity-financial-support/", description: "Council tracking of all financial support instruments" },
  { label: "EEAS — EU Assistance to Ukraine", url: "https://www.eeas.europa.eu/delegations/united-states-america/eu-assistance-ukraine-us-dollars_en", description: "Total EU assistance tracker including military and humanitarian" },
];

export default function AssistanceChart({ data }: { data: TradeDataPoint[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h3 className="font-bold text-base" style={{ color: "#1A1A2E" }}>EU Financial Assistance to Ukraine</h3>
        <SourceModal title="EU Financial Assistance to Ukraine" sources={sources} note="Annual macro-financial EU assistance (loans + grants). Does not include military support or EU member state bilateral aid. 2024–2025 figures reflect Ukraine Facility disbursements. Total EU assistance including all instruments exceeds €194B." />
      </div>
      <p className="text-xs text-gray-400 mb-4">Annual EU macro-financial support in billions of euros (European Commission)</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} role="img" aria-label="Area chart showing EU financial assistance to Ukraine over time in billions of euros. Includes a reference line at 2022 marking the start of the full-scale war.">
          <defs>
            <linearGradient id="assistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#003399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#003399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="B€" />
          <Tooltip formatter={(v) => [`€${v}B`, "EU Assistance"]} />
          <ReferenceLine x={2022} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "Full-scale war", position: "top", fontSize: 10 }} />
          <Area type="monotone" dataKey="value" stroke="#003399" strokeWidth={2.5} fill="url(#assistGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
