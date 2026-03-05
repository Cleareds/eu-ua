import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DisclaimerBanner from "@/components/ui/disclaimer-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eu-ua.com"),
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
        <DisclaimerBanner />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
