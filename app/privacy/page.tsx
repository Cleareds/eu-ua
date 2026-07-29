import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Notice — EU-UA.com",
  description:
    "What personal data EU-UA.com collects, why, and how to have it removed. Plain language, no tracking beyond basic analytics.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "29 July 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F9FA" }}>
      <div className="py-12 px-4" style={{ backgroundColor: "#003399" }}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Notice</h1>
          <p className="text-white/70">Last updated {UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 text-base leading-relaxed border-l-4 pl-4" style={{ borderColor: "#FFD700" }}>
            EU-UA.com is a free educational platform. You can read everything on this site without an
            account, without logging in, and without giving us any personal data. The only personal data
            we ask for is an email address, and only if you choose to subscribe to the newsletter.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>Who is responsible</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This site is built and maintained by Cleareds, a small company based in Belgium. For any
            question about your data, or to ask us to delete it, email{" "}
            <a href="mailto:hello@cleareds.com" className="underline" style={{ color: "#003399" }}>
              hello@cleareds.com
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>The newsletter</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you subscribe, we store your email address, the date you subscribed, the wording of the
            consent you agreed to, and which page you subscribed from. We store the consent wording because
            the GDPR requires us to be able to show what you actually agreed to — not merely that you
            agreed.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            The legal basis is your consent. We use the address for one thing only: sending the EU-UA.com
            newsletter about Ukraine&apos;s EU integration. We do not sell, rent, or share the list, and we
            do not use it for advertising.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Every email contains a one-click unsubscribe link. You can also email us and we will remove you
            by hand. When you unsubscribe we keep a record that the address opted out, so that we do not
            email you again by mistake; ask us and we will delete the record entirely.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>Analytics</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use Google Analytics to see which pages people find useful — roughly how many visitors a page
            gets, which country they came from, and which site linked to us. Google Analytics sets cookies in
            your browser and processes data on Google&apos;s infrastructure. We do not use it to build
            advertising profiles, and we do not run ads on this site.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            You can block this entirely with any browser setting or extension that blocks analytics scripts,
            and nothing on the site will stop working.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>Hosting and storage</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The site is hosted on Vercel and its content is stored in Supabase. Like any web host, they
            process the technical request data needed to serve pages, such as IP addresses in short-lived
            server logs. We do not keep our own logs of your visits.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>Your rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Under the GDPR you can ask us for a copy of the personal data we hold about you, ask us to
            correct or delete it, and withdraw your consent at any time. Since the only data we hold is a
            newsletter subscription, in practice this means: unsubscribing, or emailing us to be deleted.
            We will respond within one month. If you are unhappy with how we handle it, you can complain to
            the Belgian Data Protection Authority.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-2" style={{ color: "#1A1A2E" }}>Changes</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If this notice changes in a way that affects you, we will update the date at the top and say so
            in the newsletter.
          </p>

          <p className="text-sm text-gray-500 mt-10">
            Questions about the project itself rather than your data?{" "}
            <Link href="/contact" className="underline" style={{ color: "#003399" }}>
              Contact page
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
