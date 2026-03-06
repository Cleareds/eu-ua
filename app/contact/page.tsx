import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact & Support — EU-UA.com",
  description: "Support EU-UA.com — a free educational platform about Ukraine's European identity and EU integration. Get in touch with the team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#003399" }}>
          Get in touch
        </div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: "#1A1A2E" }}>Contact & Support</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          EU-UA.com is a free, independent educational platform with no ads and no paywall. If you find it useful, there are a few ways to help it grow.
        </p>
      </div>

      {/* Support the initiative */}
      <div className="bg-white rounded-2xl border-2 p-8 mb-8" style={{ borderColor: "#003399" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFD700" }}>
            <span className="font-bold text-sm" style={{ color: "#003399" }}>EU</span>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#1A1A2E" }}>Support This Initiative</h2>
        </div>
        <p className="text-gray-600 mb-6 leading-relaxed">
          This platform is built and maintained by{" "}
          <a href="https://cleareds.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2" style={{ color: "#003399" }}>
            Cleareds
          </a>
          , a small company based in Belgium. It is not monetised — the goal is simply to make accurate, accessible information about Ukraine's European identity available to everyone, for free.
        </p>
        <p className="text-gray-600 mb-6 leading-relaxed">
          If you would like to support the platform — whether through collaboration, data contributions, translation help, or simply spreading the word — we would love to hear from you.
        </p>
        <a
          href="mailto:hello@cleareds.com"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#003399", color: "white" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          hello@cleareds.com
        </a>
      </div>

      {/* Ways to help */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-5" style={{ color: "#1A1A2E" }}>Ways to Help</h2>
        <div className="space-y-4">
          {[
            {
              icon: "📣",
              title: "Spread the word",
              text: "Share EU-UA.com with friends, colleagues, journalists, or educators who might find it useful.",
            },
            {
              icon: "🤝",
              title: "Collaborate",
              text: "Are you a researcher, journalist, or organisation working on Ukraine-EU topics? We're open to data partnerships and content collaboration.",
            },
            {
              icon: "🌐",
              title: "Translate",
              text: "Help make the platform accessible in Ukrainian or other European languages. Native speakers welcome.",
            },
            {
              icon: "🐛",
              title: "Report errors",
              text: "If you spot outdated data, a factual inaccuracy, or a broken feature, please let us know.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-5 bg-white rounded-xl border" style={{ borderColor: "#E5E7EB" }}>
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: "#1A1A2E" }}>{item.title}</h3>
                <p className="text-sm text-gray-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note on Ukraine */}
      <div className="rounded-xl p-6 mb-8" style={{ backgroundColor: "#F0F4FF" }}>
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold" style={{ color: "#003399" }}>A note on intent —</span>{" "}
          This platform does not profit from Ukraine's war or struggles. It exists to educate and inform. Any support received goes directly towards hosting, development, and keeping the platform up to date.
        </p>
      </div>

      {/* Back link */}
      <Link href="/" className="text-sm font-medium hover:underline" style={{ color: "#003399" }}>
        ← Back to home
      </Link>
    </div>
  );
}
