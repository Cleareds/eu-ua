import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #003399 0%, #001a66 50%, #1A1A2E 100%)",
        minHeight: "85vh",
      }}
    >
      {/* EU stars background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x = 50 + 40 * Math.cos(angle);
          const y = 50 + 40 * Math.sin(angle);
          return (
            <div
              key={i}
              className="absolute text-2xl opacity-10"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
                color: "#FFD700",
              }}
            >
              ★
            </div>
          );
        })}
      </div>

      {/* Ukrainian flag stripe */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: "linear-gradient(90deg, #003399 50%, #FFD700 50%)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-8 border" style={{ borderColor: "#FFD700", color: "#FFD700", backgroundColor: "rgba(255, 215, 0, 0.1)" }}>
          <span>🇺🇦</span>
          <span>EU Candidate Country Since June 2022</span>
          <span>🇪🇺</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl">
          Ukraine{" "}
          <span style={{ color: "#FFD700" }}>&</span>{" "}
          Europe
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-white/75 max-w-2xl mb-12 leading-relaxed">
          Explore Ukraine&apos;s deep European roots, track the EU accession journey,
          and discover the cultural connections binding two continents together.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/eu-accession"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base transition-all hover:opacity-90 hover:scale-105"
            style={{ backgroundColor: "#FFD700", color: "#003399" }}
          >
            Track EU Accession →
          </Link>
          <Link
            href="/cultural-map"
            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base transition-all border-2 text-white hover:bg-white/10"
            style={{ borderColor: "rgba(255,255,255,0.4)" }}
          >
            Explore Cultural Map
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-3xl">
          {[
            { value: "2022", label: "EU Candidate Since" },
            { value: "35", label: "Negotiation Chapters" },
            { value: "390K+", label: "Students in EU" },
            { value: "€85B+", label: "EU Support (2023)" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold" style={{ color: "#FFD700" }}>{stat.value}</div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 80L1440 80L1440 20C1200 60 900 0 720 40C540 80 240 20 0 40L0 80Z" fill="#F8F9FA" />
        </svg>
      </div>
    </section>
  );
}
