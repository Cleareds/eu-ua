"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import euData from "@/data/euUkraineData.json";

export function TradeShareChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-base mb-1" style={{ color: "#1A1A2E" }}>EU Share of Ukraine Exports</h3>
      <p className="text-xs text-gray-400 mb-4">Percentage of total Ukrainian exports going to EU countries</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={euData.tradeShare}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="%" domain={[20, 70]} />
          <Tooltip formatter={(v) => [`${v}%`, "EU Share"]} />
          <ReferenceLine x={2014} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "DCFTA", position: "top", fontSize: 10 }} />
          <ReferenceLine x={2022} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Candidacy", position: "top", fontSize: 10 }} />
          <Line type="monotone" dataKey="value" stroke="#003399" strokeWidth={2.5} dot={{ fill: "#003399", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-3">Source: Eurostat / EEAS Trade Statistics</p>
    </div>
  );
}

export function TradeGrowthChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-base mb-1" style={{ color: "#1A1A2E" }}>EU-Ukraine Trade Volume</h3>
      <p className="text-xs text-gray-400 mb-4">Total bilateral trade in billions of euros</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={euData.tradeGrowth}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="B€" />
          <Tooltip formatter={(v) => [`€${v}B`, "Trade Volume"]} />
          <ReferenceLine x={2014} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "DCFTA", position: "top", fontSize: 10 }} />
          <Line type="monotone" dataKey="value" stroke="#1a4db8" strokeWidth={2.5} dot={{ fill: "#1a4db8", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-3">Source: European Commission DG Trade</p>
    </div>
  );
}
