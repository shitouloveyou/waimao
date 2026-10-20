import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Package, Palette, ScanLine, Send } from "lucide-react";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "OEM & Private Label Cutting Tools",
  description: "OEM and private-label support for cutting tools, including product selection, logo, color, packaging, samples and pre-shipment confirmation.",
  alternates: { canonical: "/oem" },
};

export default async function OemPage() {
  const settings = await getSettings();
  return <main className="service-page">
    <header className="detail-nav"><Link href="/"><ArrowLeft /> Back home</Link><b>{settings.companyName}</b><Link className="detail-quote" href="/#quote">Request quote</Link></header>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><b>OEM Service</b></nav>
    <section className="service-hero"><span className="kicker">OEM & PRIVATE LABEL</span><h1>Build a cutting-tool range around your market.</h1><p>Start from an existing product or share a reference. We help organize product selection, branding, packaging and confirmation before production.</p><div><a className="primary" href="/#quote">Discuss your project <ArrowRight /></a><Link href="/catalog">Browse catalog</Link></div></section>
    <section className="service-options"><article><Palette/><h2>Brand details</h2><p>Logo position, handle color and visual direction can be reviewed against your retail channel.</p></article><article><Package/><h2>Packaging options</h2><p>Discuss labels, bags, cards, boxes, barcodes and carton marks for the intended market.</p></article><article><ScanLine/><h2>Sample confirmation</h2><p>Confirm the selected product and agreed presentation before moving into a production order.</p></article></section>
    <section className="service-process"><div><span className="kicker">A CLEAR WORKFLOW</span><h2>From brief to shipment.</h2><p>Each stage creates a clear decision point, so specifications and packaging are agreed before the next step.</p></div><ol><li><b>01</b><div><h3>Share the requirement</h3><p>Product use, target market, estimated quantity, reference images and packaging expectations.</p></div></li><li><b>02</b><div><h3>Match products</h3><p>Review suitable models, materials, available specifications and customization scope.</p></div></li><li><b>03</b><div><h3>Confirm sample and artwork</h3><p>Check the physical sample and approve the applicable logo or packaging details.</p></div></li><li><b>04</b><div><h3>Production and inspection</h3><p>Follow the agreed specification and complete the relevant pre-shipment checks.</p></div></li><li><b>05</b><div><h3>Pack and ship</h3><p>Confirm packing information and coordinate the chosen export delivery arrangement.</p></div></li></ol></section>
    <section className="brief-checklist"><div><Send/><h2>What to include in your first message</h2></div><ul><li><Check/>Product or reference link</li><li><Check/>Destination market</li><li><Check/>Estimated order quantity</li><li><Check/>Logo and packaging requirement</li><li><Check/>Target timing</li><li><Check/>Any testing or documentation request</li></ul><a className="primary" href="/#quote">Send your brief <ArrowRight/></a></section>
  </main>;
}
