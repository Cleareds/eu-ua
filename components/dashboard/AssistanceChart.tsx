"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import euData from "@/data/euUkraineData.json";

export default function AssistanceChart() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-base mb-1" style={{ color: "#1A1A2E" }}>EU Financial Assistance to Ukraine</h3>
      <p className="text-xs text-gray-400 mb-4">Annual EU financial support in billions of euros</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={euData.assistance}>
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
      <p className="text-xs text-gray-400 mt-3">Source: European Commission — macro-financial, humanitarian, military assistance combined</p>
    </div>
  );
}
