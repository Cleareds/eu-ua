import mythsData from "@/data/myths.json";
import { Myth } from "@/lib/types";
import MythCard from "@/components/myths/MythCard";

export const metadata = {
  title: "Myths & Reality — EU-UA.com",
  description: "Common myths about Ukraine and Europe, fact-checked with credible sources.",
};

export default function MythsPage() {
  const myths = mythsData as Myth[];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#DC2626" }}>
          ⚠️ Fact Check
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Myths & Reality</h1>
        <p className="text-gray-600">
          Common misconceptions about Ukraine's relationship with Europe — debunked with evidence and credible sources.
          Click any card to read the full reality check.
        </p>
      </div>

      <div className="space-y-4">
        {myths.map((myth) => (
          <MythCard key={myth.id} myth={myth} />
        ))}
      </div>
    </div>
  );
}
