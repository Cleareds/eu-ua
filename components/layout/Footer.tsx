import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t" style={{ backgroundColor: "#1A1A2E", color: "#F8F9FA" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#FFD700" }}>
                <span className="text-sm font-bold" style={{ color: "#003399" }}>EU</span>
              </div>
              <span className="font-bold text-lg">EU-UA.com</span>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              An educational platform exploring Ukraine's European identity and EU integration journey.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: "#FFD700" }}>Explore</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { href: "/eu-accession", label: "EU Accession Chapters" },
                { href: "/cultural-map", label: "Cultural Map" },
                { href: "/data-dashboard", label: "Data Dashboard" },
                { href: "/myths", label: "Myths & Reality" },
                { href: "/quiz", label: "Knowledge Quiz" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold mb-4" style={{ color: "#FFD700" }}>About</h3>
            <p className="text-sm text-gray-400">
              Data sourced from the European Commission, Eurostat, EEAS, and official Ukrainian government sources.
              Updated regularly as negotiations progress.
            </p>
            <p className="mt-4 text-xs text-gray-500">
              © {new Date().getFullYear()} EU-UA.com — Educational use only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
