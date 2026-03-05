import { getEUData } from "@/lib/data";
import { TradeShareChart, TradeGrowthChart } from "@/components/dashboard/TradeChart";
import StudentsChart from "@/components/dashboard/StudentsChart";
import AssistanceChart from "@/components/dashboard/AssistanceChart";

export const metadata = {
  title: "Data Dashboard — EU-UA.com",
  description: "Key statistics tracking EU-Ukraine integration: trade, students, financial assistance.",
};

export default async function DataDashboardPage() {
  const data = await getEUData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          📊 Integration Data
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Data Dashboard</h1>
        <p className="text-gray-600 max-w-2xl">
          Numbers tell the story of growing EU-Ukraine integration. From trade flows to student mobility and financial solidarity.
          Click <span className="font-medium" style={{ color: "#003399" }}>Sources</span> on any chart to see the original data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeShareChart data={data.tradeShare} />
        <StudentsChart data={data.students} />
        <AssistanceChart data={data.assistance} />
        <TradeGrowthChart data={data.tradeGrowth} />
      </div>

      <div className="mt-10 p-5 rounded-xl border" style={{ backgroundColor: "#F0F4FF", borderColor: "#DBEAFE" }}>
        <p className="text-sm text-gray-600">
          <span className="font-semibold" style={{ color: "#003399" }}>About this data:</span>{" "}
          EU-UA.com is an independent educational initiative, not affiliated with any government or EU institution.
          All statistics are aggregated from publicly available sources including Eurostat, the European Commission,
          EEAS, UNESCO, and official Ukrainian government statistics. Data is updated periodically.
        </p>
      </div>
    </div>
  );
}
