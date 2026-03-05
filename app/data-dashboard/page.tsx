import { TradeShareChart, TradeGrowthChart } from "@/components/dashboard/TradeChart";
import StudentsChart from "@/components/dashboard/StudentsChart";
import AssistanceChart from "@/components/dashboard/AssistanceChart";

export const metadata = {
  title: "Data Dashboard — EU-UA.com",
  description: "Key statistics tracking EU-Ukraine integration: trade, students, financial assistance.",
};

export default function DataDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          📊 Integration Data
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Data Dashboard</h1>
        <p className="text-gray-600 max-w-2xl">
          Numbers tell the story of growing EU-Ukraine integration. From trade flows to student mobility and financial solidarity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradeShareChart />
        <StudentsChart />
        <AssistanceChart />
        <TradeGrowthChart />
      </div>

      <div className="mt-10 p-5 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-gray-600">
          <span className="font-semibold" style={{ color: "#003399" }}>Data sources:</span>{" "}
          European Commission, Eurostat, EEAS, DG Trade, EACEA (Erasmus+ Agency), and official Ukrainian government statistics.
          Data is updated periodically. Charts show approximate values for illustrative purposes.
        </p>
      </div>
    </div>
  );
}
