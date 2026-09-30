import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Wholesale Hardware FAQ", description: "Answers about MOQ, samples, OEM branding, packaging, lead time, inspection and shipping for wholesale hardware orders." };

const questions = [
  ["What is your minimum order quantity?", "MOQ depends on the product, material, packaging and customization. Standard products may support smaller trial orders, while custom colors, logos and packaging normally require a higher quantity."],
  ["Can I request samples before ordering?", "Yes. Samples can be arranged for product evaluation. Tell us the product, target market and delivery country so we can confirm sample availability, cost and shipping."],
  ["Do you support OEM and private-label orders?", "Yes. Available options may include logo application, handle or finish colors, labels, retail cards, color boxes, cartons and product sets."],
  ["Can you manufacture from my drawing or reference product?", "You can send a drawing, specification, photo, PDF or reference product link through the inquiry form. We will review feasibility and identify the information required for quotation."],
  ["How long does production take?", "Typical lead time is shown on each product page. Actual timing depends on quantity, customization, packaging approval and production schedule, and is confirmed before ordering."],
  ["How is quality checked?", "Inspection requirements can be agreed before production. Depending on the project, checks may include dimensions, material, finish, function, packaging and pre-shipment photos."],
  ["Which shipping terms are available?", "Shipping terms and method are confirmed for each quotation. Options may include courier, air freight, sea freight or delivery through your nominated forwarder."],
];

export default function FaqPage() {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: questions.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } })) };
  return <main className="faq-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} /><Link href="/"><ArrowLeft /> Back to website</Link><header><span className="kicker">BUYER QUESTIONS</span><h1>Wholesale & OEM FAQ</h1><p>Practical answers for distributors, retailers and private-label buyers.</p></header><section>{questions.map(([question,answer],index)=><details key={question} open={index===0}><summary>{question}<b>+</b></summary><p>{answer}</p></details>)}</section><footer><h2>Have a product or project in mind?</h2><Link className="primary" href="/#quote">Send your requirements <ArrowRight /></Link></footer></main>;
}
