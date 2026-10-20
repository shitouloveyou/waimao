import type { Metadata } from "next";
import "./globals.css";
import Tracking from "./tracking";
import AnalyticsPixels from "./analytics-pixels";
import { getSettings } from "@/lib/store";
import CookieConsent from "./cookie-consent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://edgevoratools.com"),
  title: { default: "Edgevora Tools | Wholesale Cutting Tools & OEM", template: "%s | Edgevora Tools" },
  description: "Wholesale scissors, axes, forestry and cutting tools for distributors, retailers and private-label brands.",
  keywords: ["wholesale cutting tools", "axes supplier", "forestry tools", "OEM tools", "private label tools", "scissors manufacturer"],
  openGraph: { type: "website", title: "Edgevora Tools", description: "Wholesale scissors, axes, forestry and OEM cutting tools from China.", images: ["/scissors-catalog.png"] },
  twitter: { card: "summary_large_image", title: "Edgevora Tools", description: "Wholesale scissors, axes, forestry and OEM cutting tools from China.", images: ["/scissors-catalog.png"] },
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
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: settings.legalName || settings.companyName, alternateName: settings.companyName, logo: settings.logo ? `${process.env.SITE_URL || "https://edgevoratools.com"}${settings.logo}` : undefined, url: process.env.SITE_URL || "https://edgevoratools.com", email: settings.email || undefined, address: settings.address, description: settings.about, sameAs: [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean) };
  return (
    <html lang="en">
      <body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} /><AnalyticsPixels settings={settings} /><Tracking />{children}<CookieConsent /></body>
    </html>
  );
}
