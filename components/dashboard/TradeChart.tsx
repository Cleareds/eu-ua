"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import SourceModal from "@/components/ui/source-modal";
import type { TradeDataPoint } from "@/lib/types";

const tradeShareSources = [
  { label: "Eurostat — EU trade with Ukraine latest developments", url: "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=EU_trade_with_Ukraine_-_latest_developments", description: "Official Eurostat statistics on bilateral trade flows" },
  { label: "European Commission DG Trade — Ukraine", url: "https://policy.trade.ec.europa.eu/eu-trade-relationships-country-and-region/countries-and-regions/ukraine_en", description: "EU trade policy and statistics for Ukraine" },
  { label: "Euronews — How is trade between EU and Ukraine evolving?", url: "https://www.euronews.com/my-europe/2025/03/03/how-is-trade-between-the-eu-and-ukraine-evolving", description: "2025 analysis of EU-Ukraine trade trends" },
];

const tradeGrowthSources = [
  { label: "Eurostat — Trade in goods with Ukraine 2024", url: "https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20250507-1", description: "Eurostat press release on 2024 bilateral trade data" },
  { label: "Ministry of Economy of Ukraine — EU Trade Bulletin", url: "https://me.gov.ua/Documents/Detail/6e6fc02e-cabf-4279-a232-65ab1e5ce839?lang=en-GB", description: "Ukrainian government trade statistics with the EU" },
];

export function TradeShareChart({ data }: { data: TradeDataPoint[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h3 className="font-bold text-base" style={{ color: "#1A1A2E" }}>EU Share of Ukraine Exports</h3>
        <SourceModal title="EU Share of Ukraine Exports" sources={tradeShareSources} note="2024 data: EU accounted for 61% of Ukrainian export trade. Figure rose sharply after 2022 as trade with Russia collapsed. Source: Eurostat." />
      </div>
      <p className="text-xs text-gray-400 mb-4">% of total Ukrainian exports going to EU countries (Eurostat)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="%" domain={[20, 70]} />
          <Tooltip formatter={(v) => [`${v}%`, "EU Share"]} />
          <ReferenceLine x={2014} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "DCFTA", position: "top", fontSize: 10 }} />
          <ReferenceLine x={2022} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Full-scale war", position: "top", fontSize: 10 }} />
          <Line type="monotone" dataKey="value" stroke="#003399" strokeWidth={2.5} dot={{ fill: "#003399", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TradeGrowthChart({ data }: { data: TradeDataPoint[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h3 className="font-bold text-base" style={{ color: "#1A1A2E" }}>EU–Ukraine Trade Volume</h3>
        <SourceModal title="EU–Ukraine Trade Volume" sources={tradeGrowthSources} note="2024: EU exported €42.8B to Ukraine (+9.4% YoY), imported €24.5B (+7.0% YoY). Source: Eurostat, May 2025." />
      </div>
      <p className="text-xs text-gray-400 mb-4">Total bilateral trade in billions of euros (Eurostat)</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="B€" />
          <Tooltip formatter={(v) => [`€${v}B`, "Trade Volume"]} />
          <ReferenceLine x={2014} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "DCFTA", position: "top", fontSize: 10 }} />
          <Line type="monotone" dataKey="value" stroke="#1a4db8" strokeWidth={2.5} dot={{ fill: "#1a4db8", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
