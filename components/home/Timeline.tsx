import newsTimeline from "@/data/news-timeline.json";

const milestones = [
  {
    year: "1994",
    title: "Partnership & Cooperation Agreement",
    description: "Ukraine and the EU signed the Partnership and Cooperation Agreement, establishing the first formal framework for political and economic relations.",
    color: "#003399",
  },
  {
    year: "2014",
    title: "Association Agreement Signed",
    description: "Following the Euromaidan Revolution, Ukraine signed the EU Association Agreement and Deep and Comprehensive Free Trade Area (DCFTA), charting a clear European course.",
    color: "#1a4db8",
  },
  {
    year: "2022",
    title: "EU Candidate Status Granted",
    description: "The European Council unanimously granted Ukraine and Moldova EU candidate status — a historic decision made weeks after Russia's full-scale invasion began.",
    color: "#003399",
  },
  {
    year: "2024",
    title: "Accession Negotiations Opened",
    description: "The EU formally opened accession negotiations with Ukraine, beginning the chapter-by-chapter screening process with unprecedented momentum.",
    color: "#002277",
  },
];

export default function Timeline() {
  const recentNews = newsTimeline.slice(0, 3);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>
          The Integration Journey
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Thirty years of building the bridge between Ukraine and the European Union.
        </p>
      </div>

      {/* Desktop horizontal timeline */}
      <div className="hidden md:block relative">
        {/* Timeline line */}
        <div className="absolute top-8 left-0 right-0 h-0.5" style={{ backgroundColor: "#003399", opacity: 0.2 }} />

        <div className="grid grid-cols-4 gap-6 relative">
          {milestones.map((m, i) => (
            <div key={m.year} className="relative">
              {/* Dot */}
              <div
                className="w-5 h-5 rounded-full border-4 border-white shadow-lg mb-6"
                style={{ backgroundColor: m.color }}
              />
              {/* Card */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div
                  className="text-2xl font-bold mb-1"
                  style={{ color: "#003399" }}
                >
                  {m.year}
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: "#1A1A2E" }}>{m.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile vertical timeline */}
      <div className="md:hidden space-y-6 relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5" style={{ backgroundColor: "#003399", opacity: 0.2 }} />
        {milestones.map((m) => (
          <div key={m.year} className="relative pl-12">
            <div
              className="absolute left-2.5 top-3 w-4 h-4 rounded-full border-4 border-white -translate-x-1/2 shadow"
              style={{ backgroundColor: m.color }}
            />
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-xl font-bold mb-1" style={{ color: "#003399" }}>{m.year}</div>
              <h3 className="font-semibold text-sm mb-2">{m.title}</h3>
              <p className="text-xs text-gray-500">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent news */}
      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-6" style={{ color: "#1A1A2E" }}>
          Latest Developments
        </h3>
        <div className="space-y-3">
          {recentNews.map((item) => (
            <div key={item.date} className="flex gap-4 items-start p-4 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="shrink-0 text-xs text-gray-400 pt-0.5 w-24">{item.date}</div>
              <div>
                <p className="font-medium text-sm" style={{ color: "#1A1A2E" }}>{item.headline}</p>
                <p className="text-xs text-gray-500 mt-1">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
