import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Privacy Notice", robots: { index: true, follow: true } };

export default async function PrivacyPage() {
  const settings = await getSettings();
  return <main className="legal-page"><Link href="/"><ArrowLeft /> Back to website</Link><span>PRIVACY NOTICE</span><h1>How we handle your information</h1><p className="legal-updated">Last updated: September 30, 2026</p><section><h2>Information you provide</h2><p>When you send an inquiry, we may collect your name, work email, company, country or region, requested product, quantity, message and any reference file you choose to upload.</p><h2>How we use it</h2><p>We use this information to respond to your request, prepare quotations, arrange samples, discuss OEM requirements and maintain business follow-up records. We do not sell inquiry information.</p><h2>Analytics choices</h2><p>Optional analytics may measure page visits and inquiry conversions. Google Analytics, Meta Pixel or TikTok Pixel are loaded only after you accept analytics. You can decline and continue using the website.</p><h2>Storage and retention</h2><p>Inquiry records and attachments are stored for business follow-up and recordkeeping. You may request access, correction or deletion, subject to applicable business and legal retention requirements.</p><h2>Contact</h2><p>For privacy questions or requests, contact <a href={`mailto:${settings.email}`}>{settings.email}</a>.</p></section></main>;
}
