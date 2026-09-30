import type { Metadata } from "next";
import "./globals.css";
import Tracking from "./tracking";
import AnalyticsPixels from "./analytics-pixels";
import { getSettings } from "@/lib/store";

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
  return (
    <html lang="en">
      <body className="antialiased"><AnalyticsPixels settings={await getSettings()} /><Tracking />{children}</body>
    </html>
  );
}
