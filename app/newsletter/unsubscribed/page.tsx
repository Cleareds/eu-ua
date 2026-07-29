import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Newsletter — Unsubscribed — EU-UA.com",
  robots: { index: false, follow: false },
};

export default async function UnsubscribedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const notFound = status === "notfound";

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: "#FFD700" }}
      >
        <span className="text-2xl" style={{ color: "#003399" }}>
          {notFound ? "?" : "✓"}
        </span>
      </div>

      {notFound ? (
        <>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#1A1A2E" }}>
            That link didn&apos;t match a subscription
          </h1>
          <p className="text-gray-600 mb-8">
            The unsubscribe link may have already been used, or it was incomplete. If you keep receiving
            emails, reply to any of them and we&apos;ll remove you by hand.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "#1A1A2E" }}>
            You&apos;ve been unsubscribed
          </h1>
          <p className="text-gray-600 mb-8">
            You won&apos;t receive the newsletter again. Everything on the site stays free to read —
            nothing here needs an email address.
          </p>
        </>
      )}

      <Link
        href="/"
        className="inline-block px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
        style={{ backgroundColor: "#003399" }}
      >
        Back to Home
      </Link>
    </div>
  );
}
