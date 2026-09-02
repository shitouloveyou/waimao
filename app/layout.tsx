import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ForgeNova Hardware | Precision Hardware Supply",
  description: "Reliable fasteners, fittings and custom metal components for distributors and industrial buyers worldwide.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
