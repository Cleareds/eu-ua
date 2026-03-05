import Link from "next/link";

const cities = [
  {
    name: "Kyiv",
    icon: "🏛️",
    tagline: "Medieval European Capital",
    description: "One of Europe's oldest cities, Kyiv was a major center of medieval civilization with dynastic ties to France, England, and Scandinavia.",
    highlights: ["Byzantine & Baroque architecture", "UNESCO St. Sophia Cathedral", "European royal family connections"],
    href: "/cultural-map",
  },
  {
    name: "Lviv",
    icon: "🏰",
    tagline: "Habsburg Central Europe",
    description: "A UNESCO World Heritage city whose Old Town reflects Gothic, Renaissance, Baroque and Secession styles — a living museum of Central European history.",
    highlights: ["UNESCO World Heritage Old Town", "Austro-Hungarian architecture", "50 km from Polish border"],
    href: "/cultural-map",
  },
  {
    name: "Chernivtsi",
    icon: "🎭",
    tagline: "Little Vienna of the East",
    description: "Former capital of the Duchy of Bukovina under Austria-Hungary, with a UNESCO-listed university and a German-language literary tradition that produced Paul Celan.",
    highlights: ["UNESCO Metropolitan Residence", "Paul Celan's birthplace", "Viennese café culture"],
    href: "/cultural-map",
  },
];

export default function CulturalConnections() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Cultural Connections
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ukrainian cities carry centuries of European history in their streets, buildings, and traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link href={city.href} key={city.name} className="group">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all h-full flex flex-col">
                <div className="text-4xl mb-4">{city.icon}</div>
                <div className="mb-1">
                  <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "#FFD700" }}>
                    {city.tagline}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{city.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{city.description}</p>
                <ul className="space-y-1">
                  {city.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-xs text-gray-500">
                      <span style={{ color: "#FFD700" }}>✓</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/cultural-map"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm border transition-colors"
            style={{ borderColor: "#FFD700", color: "#FFD700" }}
          >
            Explore all cities on the map →
          </Link>
        </div>
      </div>
    </section>
  );
}
