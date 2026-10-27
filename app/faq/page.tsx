import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
export const metadata: Metadata = { title: "Wholesale Hardware FAQ", description: "Answers about MOQ, samples, OEM branding, packaging, lead time, inspection and shipping for wholesale hardware orders.", alternates: { canonical: "/faq" } };
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
    return <main className="faq-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><Link href="/"><ArrowLeft /><TranslatedText>{" Back to website"}</TranslatedText></Link><header><span className="kicker"><TranslatedText>{"BUYER QUESTIONS"}</TranslatedText></span><h1><TranslatedText>{"Wholesale & OEM FAQ"}</TranslatedText></h1><p><TranslatedText>{"Practical answers for distributors, retailers and private-label buyers."}</TranslatedText></p></header><section>{questions.map(([question, answer], index) => <details key={question} open={index === 0}><summary><TranslatedText>{question}</TranslatedText><b><TranslatedText>{"+"}</TranslatedText></b></summary><p><TranslatedText>{answer}</TranslatedText></p></details>)}</section><footer><h2><TranslatedText>{"Have a product or project in mind?"}</TranslatedText></h2><Link className="primary" href="/#quote"><TranslatedText>{"Send your requirements "}</TranslatedText><ArrowRight /></Link></footer></main>;
}
