import timelineData from "@/data/timeline.json";
import { TimelineEvent } from "@/lib/types";
import TimelineView from "@/components/timeline/TimelineView";

export const metadata = {
  title: "Ukraine & Europe: 2,500 Years of Shared History",
  description: "An interactive timeline of Ukraine's connections with Europe — from ancient Greek colonies to EU candidate status. Explore 2,500 years of shared history, culture, and diplomacy.",
  openGraph: {
    title: "Ukraine & Europe: 2,500 Years of History",
    description: "From Greek colonies on the Black Sea to EU candidate status — Ukraine's deep European roots, told through 30+ historical milestones.",
  },
  keywords: ["Ukraine Europe history", "Ukraine EU timeline", "Ukraine medieval history", "Kyivan Rus Europe", "Ukraine EU accession history"],
};

export default function TimelinePage() {
  const events = timelineData as TimelineEvent[];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#003399" }} className="text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-75">2,500 Years of Shared History</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ukraine & Europe</h1>
          <p className="text-lg opacity-80 max-w-2xl mx-auto">
            From ancient Greek colonies on the Black Sea to EU candidate status — explore the deep, unbroken connections between Ukraine and the European world.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <TimelineView events={events} />
      </div>
    </div>
  );
}
