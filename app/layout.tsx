import type { Metadata } from "next";
import "./globals.css";
import Tracking from "./tracking";
import LanguageSwitcher from "./language-switcher";
import { TranslationProvider } from "./translation-context";
import AnalyticsPixels from "./analytics-pixels";
import { getSettings } from "@/lib/store";
import CookieConsent from "./cookie-consent";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://edgevoratools.com"),
  title: { default: "Edgevora Tools | Wholesale Cutting Tools & OEM", template: "%s | Edgevora Tools" },
  description: "Wholesale cutting tools for distributors and retailers. Explore current products and request a quotation.",
  keywords: ["wholesale cutting tools", "pruning shears supplier", "garden tools", "OEM tools", "private label tools", "cutting tools supplier"],
  openGraph: { type: "website", title: "Edgevora Tools", description: "Explore current cutting tools and request wholesale pricing and samples.", images: [] },
  twitter: { card: "summary_large_image", title: "Edgevora Tools", description: "Explore current cutting tools and request wholesale pricing and samples.", images: [] },
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
  const hasAnalytics = Boolean(
    /^G-[A-Z0-9]+$/i.test(settings.googleAnalyticsId || "") ||
    /^\d{5,30}$/.test(settings.metaPixelId || "") ||
    /^[A-Z0-9]{10,30}$/i.test(settings.tiktokPixelId || ""),
  );
  const organization = { "@context": "https://schema.org", "@type": "Organization", name: settings.legalName || settings.companyName, alternateName: settings.companyName, logo: settings.logo ? `${process.env.SITE_URL || "https://edgevoratools.com"}${settings.logo}` : undefined, url: process.env.SITE_URL || "https://edgevoratools.com", email: settings.email || undefined, address: settings.address, description: "Tool sourcing and wholesale inquiries. Contact us for our current product range and order requirements.", sameAs: [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean) };
  return (
    <html lang="en">
      <body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} /><AnalyticsPixels settings={settings} /><Tracking /><TranslationProvider><LanguageSwitcher />{children}<CookieConsent enabled={hasAnalytics} /></TranslationProvider></body>
    </html>
  );
}
