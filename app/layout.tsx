import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DisclaimerBanner from "@/components/ui/disclaimer-banner";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // cyrillic is needed for the Ukrainian names and titles shown across the art
  // and people sections — without it they fall back to a system font.
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EU-UA.com — Ukraine & Europe",
    template: "%s — EU-UA.com",
  },
  description: "An independent educational platform exploring Ukraine's European identity, tracking EU accession progress, and connecting the cultural ties between Ukraine and Europe.",
  keywords: ["Ukraine EU accession", "Ukraine European Union", "EU integration Ukraine", "Ukraine EU chapters", "Ukraine Europe culture", "EU enlargement Ukraine"],
  authors: [{ name: "EU-UA.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "EU-UA.com",
    title: "EU-UA.com — Ukraine & Europe",
    description: "Interactive educational platform: track Ukraine's EU accession chapters, explore cultural connections, and follow integration progress.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "EU-UA.com — Ukraine & Europe" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EU-UA.com — Ukraine & Europe",
    description: "Track Ukraine's EU accession, explore cultural connections, and follow integration progress.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`} style={{ backgroundColor: "#F8F9FA", color: "#1A1A2E" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "EU-UA.com",
              url: SITE_URL,
              description: "An independent educational platform exploring Ukraine's European identity, tracking EU accession progress, and connecting the cultural ties between Ukraine and Europe.",
              publisher: {
                "@type": "Organization",
                name: "EU-UA.com",
                url: SITE_URL,
                logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
              },
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <DisclaimerBanner />
        <Header />
        <Breadcrumbs />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {/* Analytics loads after hydration so it never competes with the page's own
            JS for the main thread during load. */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-19QC7D2JX0"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-19QC7D2JX0');`}
        </Script>
      </body>
    </html>
  );
}
