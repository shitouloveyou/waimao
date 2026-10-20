import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Box, CheckCircle2, ClipboardCheck, PackageCheck, Ruler } from "lucide-react";
import { getSettings } from "@/lib/store";

export const metadata: Metadata = {
  title: "Quality & Pre-shipment Inspection",
  description: "A practical quality review process for wholesale and private-label cutting tools, from specification confirmation to packing checks.",
  alternates: { canonical: "/quality" },
};

export default async function QualityPage() {
  const settings = await getSettings();
  return <main className="service-page quality-page">
    <header className="detail-nav"><Link href="/"><ArrowLeft /> Back home</Link><b>{settings.companyName}</b><Link className="detail-quote" href="/#quote">Start an inquiry</Link></header>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><b>Quality & Inspection</b></nav>
    <section className="service-hero"><span className="kicker">QUALITY & INSPECTION</span><h1>Make the specification clear before shipment.</h1><p>Quality control begins with an agreed product brief. The relevant dimensions, materials, finish, function, branding and packing points can then be checked against that reference.</p><div><a className="primary" href="/#quote">Discuss inspection needs <ArrowRight /></a><Link href="/oem">View OEM workflow</Link></div></section>
    <section className="inspection-grid"><article><ClipboardCheck/><span>01</span><h2>Specification review</h2><p>Confirm the product model, material, size, finish and agreed customization points.</p></article><article><Ruler/><span>02</span><h2>Product checks</h2><p>Review applicable dimensions, appearance, assembly and functional checkpoints.</p></article><article><CheckCircle2/><span>03</span><h2>Branding review</h2><p>Check the agreed logo position, artwork and visible product presentation.</p></article><article><PackageCheck/><span>04</span><h2>Packing review</h2><p>Verify packaging type, labels, quantities and carton information before shipment.</p></article></section>
    <section className="evidence-section"><div><Box/><span className="kicker">BUYER VISIBILITY</span><h2>Ask for the evidence relevant to your order.</h2></div><p>Depending on the product and project, buyers can request sample confirmation, product photos, packaging previews, testing videos or pre-shipment inspection records. The exact checklist should be agreed during quotation rather than assumed.</p><a href="/#quote">Tell us what you need <ArrowRight/></a></section>
  </main>;
}
