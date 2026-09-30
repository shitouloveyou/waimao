import type { Metadata } from "next";
import "./globals.css";
import Tracking from "./tracking";
import AnalyticsPixels from "./analytics-pixels";
import { getSettings } from "@/lib/store";
import CookieConsent from "./cookie-consent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://example.com"),
  title: { default: "ForgeNova Hardware | Wholesale Tools & OEM", template: "%s | ForgeNova Hardware" },
  description: "Wholesale scissors, hand tools and hardware products for distributors, retailers and private-label brands.",
  keywords: ["wholesale hardware", "hand tools supplier", "OEM tools", "private label hardware", "scissors manufacturer", "cutting tools supplier"],
  openGraph: { type: "website", title: "ForgeNova Hardware", description: "Wholesale tools, scissors and OEM hardware products from China.", images: ["/scissors-catalog.png"] },
  twitter: { card: "summary_large_image", title: "ForgeNova Hardware", description: "Wholesale tools, scissors and OEM hardware products from China.", images: ["/scissors-catalog.png"] },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: settings.legalName || settings.companyName, alternateName: settings.companyName, logo: settings.logo ? `${process.env.SITE_URL || "https://example.com"}${settings.logo}` : undefined, url: process.env.SITE_URL || "https://example.com", email: settings.email, address: settings.address, description: settings.about, sameAs: [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean) };
  return (
    <html lang="en">
      <body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} /><AnalyticsPixels settings={settings} /><Tracking />{children}<CookieConsent /></body>
    </html>
  );
}
