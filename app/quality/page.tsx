import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";
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
    <header className="detail-nav"><Link href="/"><ArrowLeft /><TranslatedText>{" Back home"}</TranslatedText></Link><b><TranslatedText>{settings.companyName}</TranslatedText></b><Link className="detail-quote" href="/#quote"><TranslatedText>{"Start an inquiry"}</TranslatedText></Link></header>
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/"><TranslatedText>{"Home"}</TranslatedText></Link><span><TranslatedText>{"/"}</TranslatedText></span><b><TranslatedText>{"Quality & Inspection"}</TranslatedText></b></nav>
    <section className="service-hero"><span className="kicker"><TranslatedText>{"QUALITY & INSPECTION"}</TranslatedText></span><h1><TranslatedText>{"Make the specification clear before shipment."}</TranslatedText></h1><p><TranslatedText>{"Quality control begins with an agreed product brief. The relevant dimensions, materials, finish, function, branding and packing points can then be checked against that reference."}</TranslatedText></p><div><a className="primary" href="/#quote"><TranslatedText>{"Discuss inspection needs "}</TranslatedText><ArrowRight /></a><Link href="/oem"><TranslatedText>{"View OEM workflow"}</TranslatedText></Link></div></section>
    <section className="inspection-grid"><article><ClipboardCheck /><span><TranslatedText>{"01"}</TranslatedText></span><h2><TranslatedText>{"Specification review"}</TranslatedText></h2><p><TranslatedText>{"Confirm the product model, material, size, finish and agreed customization points."}</TranslatedText></p></article><article><Ruler /><span><TranslatedText>{"02"}</TranslatedText></span><h2><TranslatedText>{"Product checks"}</TranslatedText></h2><p><TranslatedText>{"Review applicable dimensions, appearance, assembly and functional checkpoints."}</TranslatedText></p></article><article><CheckCircle2 /><span><TranslatedText>{"03"}</TranslatedText></span><h2><TranslatedText>{"Branding review"}</TranslatedText></h2><p><TranslatedText>{"Check the agreed logo position, artwork and visible product presentation."}</TranslatedText></p></article><article><PackageCheck /><span><TranslatedText>{"04"}</TranslatedText></span><h2><TranslatedText>{"Packing review"}</TranslatedText></h2><p><TranslatedText>{"Verify packaging type, labels, quantities and carton information before shipment."}</TranslatedText></p></article></section>
    <section className="evidence-section"><div><Box /><span className="kicker"><TranslatedText>{"BUYER VISIBILITY"}</TranslatedText></span><h2><TranslatedText>{"Ask for the evidence relevant to your order."}</TranslatedText></h2></div><p><TranslatedText>{"Depending on the product and project, buyers can request sample confirmation, product photos, packaging previews, testing videos or pre-shipment inspection records. The exact checklist should be agreed during quotation rather than assumed."}</TranslatedText></p><a href="/#quote"><TranslatedText>{"Tell us what you need "}</TranslatedText><ArrowRight /></a></section>
  </main>;
}
