import { getMyths } from "@/lib/data";
import MythCard from "@/components/myths/MythCard";

export const metadata = {
  title: "Ukraine & Europe Myths Debunked — Fact Check",
  description: "Common myths about Ukraine's relationship with Europe, fact-checked with credible sources. Is Ukraine really isolated from Europe? Are Ukrainians and Russians the same people?",
  openGraph: {
    title: "Ukraine & Europe Myths Debunked",
    description: "6 common misconceptions about Ukraine and Europe, fact-checked with evidence and credible sources.",
  },
  keywords: ["Ukraine Europe myths", "Ukraine EU facts", "Ukraine history Europe", "Ukraine Russia difference", "Ukraine EU member"],
};

export default async function MythsPage() {
  const myths = await getMyths();

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
        <p className="text-xs text-gray-400 mt-3">
          Independent initiative. Sources listed inside each card. Not affiliated with any government or EU institution.
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
