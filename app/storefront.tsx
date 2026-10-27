"use client";
import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";

import { productPath, isGardenCatalog } from "@/lib/product-presentation";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Facebook, Heart, Instagram, Mail, Menu, MessageCircle, PackageCheck, Scale, Scissors, ShieldCheck, ShoppingBasket, Trash2, X } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/types";
import { categorySlug } from "@/lib/slug";
import BrandMark from "./brand-mark";
import CompanyProof from "./company-proof";
import HeroMedia from "./hero-media";
const socialIcon = (name: string) => name === "Instagram" ? <Instagram /> : name === "Facebook" ? <Facebook /> : <span className="tiktok-mark"><TranslatedText>{"TK"}</TranslatedText></span>;
export default function Storefront({ initialProducts, settings }: {
    initialProducts: Product[];
    settings: SiteSettings;
}) {
    const [menu, setMenu] = useState(false);
    const [category, setCategory] = useState("All");
    const [productSearch, setProductSearch] = useState("");
    const [selected, setSelected] = useState("");
    const [requestType, setRequestType] = useState("Wholesale quote");
    const [sent, setSent] = useState(false);
    const attachmentInput = useRef<HTMLInputElement>(null);
    const [attachmentName, setAttachmentName] = useState("");
    const [emailCopied, setEmailCopied] = useState(false);
    const [busy, setBusy] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [tracking, setTracking] = useState<Record<string, string>>({});
    const [favorites, setFavorites] = useState<string[]>([]);
    const [compare, setCompare] = useState<string[]>([]);
    const [basket, setBasket] = useState<Record<string, number>>({});
    const [toolPanel, setToolPanel] = useState<"basket" | "favorites" | "compare" | null>(null);
    const [showToolDock, setShowToolDock] = useState(false);
    const gardenCatalog = isGardenCatalog(initialProducts);
    const genericTaglines = ["Cutting tools engineered for your market.", "Hardware products engineered for your market.", "Scissors engineered for your market."];
    const headline = gardenCatalog && (!settings.tagline || genericTaglines.includes(settings.tagline)) ? "Pruning shears for your wholesale business." : settings.tagline || "Cutting tools for your business.";
    const about = gardenCatalog && settings.about.startsWith("We help overseas distributors and brands source dependable scissors") ? "Edgevora Tools is the tool sourcing brand of Linyi Runxi Trading Co., Ltd., based in Linyi, Shandong, China. Our current range focuses on SK5 garden pruning shears for distributors and garden retailers. Contact us to discuss product selection, samples and order requirements." : settings.about;
    const categories = ["All", ...Array.from(new Set(initialProducts.map(product => product.category)))];
    const products = useMemo(() => initialProducts.filter(product => (category === "All" || product.category === category) && `${product.name} ${product.category} ${product.sku || ""} ${product.material}`.toLowerCase().includes(productSearch.toLowerCase())), [category, productSearch, initialProducts]);
    const socials = [["Instagram", settings.instagram], ["Facebook", settings.facebook], ["TikTok", settings.tiktok]].filter((item): item is [
        string,
        string
    ] => Boolean(item[1]));
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSelected(params.get("product") || "");
        setRequestType(params.get("request") === "sample" ? "Sample request" : params.get("request") === "oem" ? "OEM / private label project" : "Wholesale quote");
        setTracking({
            source: document.referrer || "Direct",
            landingPage: window.location.href,
            utmSource: params.get("utm_source") || "",
            utmMedium: params.get("utm_medium") || "",
            utmCampaign: params.get("utm_campaign") || "",
        });
        try {
            setFavorites(JSON.parse(localStorage.getItem("fn_favorites") || "[]"));
            setCompare(JSON.parse(localStorage.getItem("fn_compare") || "[]"));
            setBasket(JSON.parse(localStorage.getItem("fn_basket") || "{}"));
        }
        catch { }
    }, []);
    useEffect(() => {
        const updateDock = () => setShowToolDock(window.scrollY > 620);
        updateDock();
        window.addEventListener("scroll", updateDock, { passive: true });
        return () => window.removeEventListener("scroll", updateDock);
    }, []);
    useEffect(() => { localStorage.setItem("fn_favorites", JSON.stringify(favorites)); }, [favorites]);
    useEffect(() => { localStorage.setItem("fn_compare", JSON.stringify(compare)); }, [compare]);
    useEffect(() => { localStorage.setItem("fn_basket", JSON.stringify(basket)); }, [basket]);
    const toggleFavorite = (id: string) => setFavorites(items => items.includes(id) ? items.filter(x => x !== id) : [...items, id]);
    const toggleCompare = (id: string) => setCompare(items => items.includes(id) ? items.filter(x => x !== id) : items.length < 4 ? [...items, id] : (alert("You can compare up to 4 products."), items));
    const addBasket = (id: string) => setBasket(items => ({ ...items, [id]: (items[id] || 0) + 1 }));
    const basketProducts = initialProducts.filter(product => basket[product.id]);
    const compareProducts = initialProducts.filter(product => compare.includes(product.id));
    const useInquiryList = () => { const summary = basketProducts.map(product => `${product.name} × ${basket[product.id]}`).join("; "); setSelected(summary); setRequestType("Wholesale quote"); setToolPanel(null); setTimeout(() => document.querySelector("#quote")?.scrollIntoView({ behavior: "smooth" }), 0); };
    async function copyEmail() {
        try {
            await navigator.clipboard.writeText(settings.email);
            setEmailCopied(true);
            window.setTimeout(() => setEmailCopied(false), 2000);
        }
        catch {
            window.prompt("Copy email address:", settings.email);
        }
    }
    async function submit(formData: FormData) {
        if (busy)
            return;
        setBusy(true);
        setSubmitError("");
        try {
            let attribution = tracking;
            try {
                attribution = JSON.parse(sessionStorage.getItem("fn_attribution") || JSON.stringify(tracking));
            }
            catch { }
            Object.entries(attribution).forEach(([key, value]) => formData.set(key, String(value)));
            formData.set("visitor", sessionStorage.getItem("fn_visitor") || "");
            const response = await fetch("/api/inquiries", { method: "POST", body: formData });
            if (!response.ok) {
                const result = await response.json().catch(() => null);
                throw new Error(result?.error || "Unable to send. Please try again.");
            }
            setSent(true);
            setAttachmentName("");
            const win = window as typeof window & {
                gtag?: (...args: unknown[]) => void;
                fbq?: (...args: unknown[]) => void;
                ttq?: {
                    track?: (...args: unknown[]) => void;
                };
            };
            win.gtag?.("event", "generate_lead", { request_type: requestType, product: selected });
            win.fbq?.("track", "Lead", { request_type: requestType, content_name: selected });
            win.ttq?.track?.("SubmitForm", { content_name: selected, description: requestType });
        }
        catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Unable to send. Please try again.");
        }
        finally {
            setBusy(false);
        }
    }
    const imageStyle = (product: Product) => product.image ? {
        backgroundImage: `url(${product.image})`,
        backgroundPosition: product.image === "/scissors-catalog.png" ? product.imagePosition || "center" : "center",
        backgroundSize: product.image === "/scissors-catalog.png" && product.imagePosition ? "300% 200%" : "contain",
        backgroundRepeat: "no-repeat",
    } : undefined;
    return <main>
    {submitError && <div className="form-feedback" role="alert"><TranslatedText>{submitError}</TranslatedText></div>}
    {busy && <div className="form-feedback" role="status"><TranslatedText>{"Sending your inquiry\u2026"}</TranslatedText></div>}
    <header className="nav">
      <a className="brand" href="#top"><BrandMark settings={settings}/><b><TranslatedText>{settings.companyName.toUpperCase()}</TranslatedText></b><small><TranslatedText>{"CUTTING TOOLS \u00B7 OEM"}</TranslatedText></small></a>
      <nav className={menu ? "open" : ""}>
        <a href="#products"><TranslatedText>{"Products"}</TranslatedText></a><Link href="/oem"><TranslatedText>{"OEM Service"}</TranslatedText></Link><Link href="/quality"><TranslatedText>{"Quality"}</TranslatedText></Link><Link href="/faq"><TranslatedText>{"FAQ"}</TranslatedText></Link><a href="#about"><TranslatedText>{"About"}</TranslatedText></a><a className="nav-quote" href="#quote"><TranslatedText>{"Request a Quote"}</TranslatedText></a>
      </nav>
      <TranslatedButton className="menu" aria-label="Toggle navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</TranslatedButton>
    </header>

    <section className="hero scissors-hero" id="top">
      <HeroMedia images={settings.heroImages} image={settings.heroImage || initialProducts.find(product => product.image && product.image !== "/scissors-catalog.png")?.image}/>
      <div className="hero-copy">
        <div className="eyebrow"><TranslatedText>{"CUTTING TOOLS \u00B7 PRIVATE LABEL \u00B7 GLOBAL SUPPLY"}</TranslatedText></div>
        <h1><TranslatedText>{headline}</TranslatedText></h1>
        <p><TranslatedText>{gardenCatalog ? "Explore our SK5 garden pruning shears for distributors and garden retailers. Ask about samples, wholesale quantities and packaging requirements." : "Explore our current cutting tools for distributors and retail brands. Contact us about product selection, samples and order requirements."}</TranslatedText></p>
        <div className="hero-actions"><a className="primary" href="#products"><TranslatedText>{"Explore Products "}</TranslatedText><ArrowRight /></a><a className="ghost" href="#quote"><TranslatedText>{"Request a Quote"}</TranslatedText></a></div>
        <div className="markets"><span><TranslatedText>{"Built for"}</TranslatedText></span><b><TranslatedText>{"Distributors"}</TranslatedText></b><b><TranslatedText>{"Retail Brands"}</TranslatedText></b><b><TranslatedText>{"Importers"}</TranslatedText></b></div>
      </div>
    </section>

    <section className="trust">
      <div><PackageCheck /><b><TranslatedText>{"Order Quantities"}</TranslatedText></b><span><TranslatedText>{"Confirmed for each model and packaging"}</TranslatedText></span></div>
      <div><ShieldCheck /><b><TranslatedText>{"Product Checks"}</TranslatedText></b><span><TranslatedText>{"Agree your inspection requirements"}</TranslatedText></span></div>
      <div><Scissors /><b><TranslatedText>{"Packaging Options"}</TranslatedText></b><span><TranslatedText>{"Ask about availability and minimums"}</TranslatedText></span></div>
    </section>

    <section className="section" id="products">
      <div className="section-head"><div><span className="kicker"><TranslatedText>{"PRODUCT PROGRAM"}</TranslatedText></span><h2><TranslatedText>{gardenCatalog ? "Find the right pruning shears for your market." : "Find the right cutting tool for your market."}</TranslatedText></h2></div><p><TranslatedText>{"Choose from our current products or send a reference photo. Tell us your target quantity, packaging needs and destination for a model-specific quotation."}</TranslatedText></p></div>
      <div className="store-search"><TranslatedInput value={productSearch} onChange={event => setProductSearch(event.target.value)} placeholder="Search by product, category, SKU or material..."/><span><TranslatedText>{products.length}</TranslatedText><TranslatedText>{" products found"}</TranslatedText></span></div>
      <div className="filters">{categories.map(item => <TranslatedButton key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}><TranslatedText>{item}</TranslatedText></TranslatedButton>)}</div>
      <div className="category-links"><span><TranslatedText>{"Browse category pages:"}</TranslatedText></span>{categories.filter(item => item !== "All").map(item => <Link href={`/categories/${categorySlug(item)}`} key={item}><TranslatedText>{item}</TranslatedText></Link>)}</div>
      <div className="products">{products.map((product) => <article className="product" key={product.id}>
        <Link href={productPath(product)} className="product-art" style={imageStyle(product)} aria-label={`View ${product.name}`}><span><TranslatedText>{String(initialProducts.findIndex(item => item.id === product.id) + 1).padStart(2, "0")}</TranslatedText></span></Link>
        <div className="product-body"><span className="product-category"><TranslatedText>{product.category}</TranslatedText></span><h3><Link href={productPath(product)}><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></Link></h3><p><TranslatedText field="description" translations={product.translations}>{product.description}</TranslatedText></p><dl><div><dt><TranslatedText>{"Material"}</TranslatedText></dt><dd><TranslatedText>{product.material}</TranslatedText></dd></div><div><dt><TranslatedText>{"MOQ"}</TranslatedText></dt><dd><TranslatedText>{product.moq}</TranslatedText></dd></div></dl><div className="product-card-tools"><TranslatedButton className={favorites.includes(product.id) ? "selected" : ""} onClick={() => toggleFavorite(product.id)} title="Save product"><Heart /><TranslatedText>{" Save"}</TranslatedText></TranslatedButton><TranslatedButton className={compare.includes(product.id) ? "selected" : ""} onClick={() => toggleCompare(product.id)} title="Compare product"><Scale /><TranslatedText>{" Compare"}</TranslatedText></TranslatedButton><TranslatedButton className={basket[product.id] ? "selected" : ""} onClick={() => addBasket(product.id)} title="Add to inquiry list"><ShoppingBasket /><TranslatedText>{" Add to RFQ"}</TranslatedText></TranslatedButton></div><div className="product-foot"><b><TranslatedText>{product.price}</TranslatedText></b><Link href={productPath(product)}><TranslatedText>{"Details "}</TranslatedText><ArrowRight /></Link></div></div>
      </article>)}</div>
    </section>

    <section className="capabilities" id="capabilities"><div><span className="kicker"><TranslatedText>{"FROM IDEA TO RETAIL SHELF"}</TranslatedText></span><h2><TranslatedText>{"A direct contact for your sourcing project."}</TranslatedText></h2><p><TranslatedText>{"Discuss product selection, samples and packaging with one point of contact. Customization, inspection and shipping requirements are confirmed in your quotation."}</TranslatedText></p><a href="#quote"><TranslatedText>{"Discuss your program "}</TranslatedText><ArrowRight /></a></div><ol><li><span><TranslatedText>{"01"}</TranslatedText></span><div><b><TranslatedText>{"Product & market brief"}</TranslatedText></b><p><TranslatedText>{"Tell us your target users, price point, sales channel and destination market."}</TranslatedText></p></div></li><li><span><TranslatedText>{"02"}</TranslatedText></span><div><b><TranslatedText>{"Sample & packaging"}</TranslatedText></b><p><TranslatedText>{"Discuss sample availability and agree product and packaging details before ordering."}</TranslatedText></p></div></li><li><span><TranslatedText>{"03"}</TranslatedText></span><div><b><TranslatedText>{"Inspection & export"}</TranslatedText></b><p><TranslatedText>{"Agree the inspection checklist, packing requirements and shipping terms for your order."}</TranslatedText></p></div></li></ol></section>

    <section className="content-section" id="content"><div className="section-head"><div><span className="kicker"><TranslatedText>{"PROOF YOU CAN SEE"}</TranslatedText></span><h2><TranslatedText>{"Know what to confirm before ordering."}</TranslatedText></h2></div><p><TranslatedText>{"Discuss the product information and evidence needed for your order. Available photos, samples and checks depend on the model and your requirements."}</TranslatedText></p></div><div className="content-grid"><article><b><TranslatedText>{"01"}</TranslatedText></b><h3><TranslatedText>{"Cutting tests"}</TranslatedText></h3><p><TranslatedText>{"Ask about a sample or a cutting demonstration for your intended use."}</TranslatedText></p></article><article><b><TranslatedText>{"02"}</TranslatedText></b><h3><TranslatedText>{"OEM previews"}</TranslatedText></h3><p><TranslatedText>{"Confirm customization availability, artwork and minimum quantities before ordering."}</TranslatedText></p></article><article><b><TranslatedText>{"03"}</TranslatedText></b><h3><TranslatedText>{"Inspection records"}</TranslatedText></h3><p><TranslatedText>{"Agree which inspection photos and checkpoints are needed before shipment."}</TranslatedText></p></article></div></section>

    <section className="about" id="about"><span className="kicker"><TranslatedText>{settings.companyName.toUpperCase()}</TranslatedText></span><h2><TranslatedText>{"Industrial discipline."}</TranslatedText><br /><TranslatedText>{"Personal service."}</TranslatedText></h2><p><TranslatedText>{about}</TranslatedText></p><div className="stats"><div><b><TranslatedText>{"24h"}</TranslatedText></b><span><TranslatedText>{"Typical quote response"}</TranslatedText></span></div><div><b><TranslatedText>{"Options"}</TranslatedText></b><span><TranslatedText>{"Model-specific quotation"}</TranslatedText></span></div><div><b><TranslatedText>{"1-to-1"}</TranslatedText></b><span><TranslatedText>{"Direct project contact"}</TranslatedText></span></div></div>{socials.length > 0 && <div className="social-links">{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer"><TranslatedText>{socialIcon(name)}</TranslatedText> <TranslatedText>{name}</TranslatedText></a>)}</div>}</section>

    <section className="quote" id="quote"><div className="quote-intro"><span className="kicker"><TranslatedText>{"START A SOURCING CONVERSATION"}</TranslatedText></span><h2><TranslatedText>{"Tell us what you want to sell."}</TranslatedText></h2><p><TranslatedText>{"Share a reference product, target price, expected quantity or destination market. We will respond with practical options and the questions needed for a reliable quote."}</TranslatedText></p><div className="contact-cards" id="contact">{settings.email && <div className="contact-email"><a href={`mailto:${settings.email}`} title={`Email ${settings.email}`}><Mail /><span><small><TranslatedText>{"Email"}</TranslatedText></small><TranslatedText>{settings.email}</TranslatedText></span></a><TranslatedButton type="button" onClick={copyEmail} aria-label={`Copy ${settings.email}`}><TranslatedText>{emailCopied ? "Copied" : "Copy email"}</TranslatedText></TranslatedButton></div>}{settings.whatsapp.startsWith("http") && <a href={settings.whatsapp}><MessageCircle /><span><small><TranslatedText>{"WhatsApp"}</TranslatedText></small><TranslatedText>{"Message us directly"}</TranslatedText></span></a>}{settings.wechat && <a href="#quote"><MessageCircle /><span><small><TranslatedText>{"WeChat"}</TranslatedText></small><TranslatedText>{settings.wechat}</TranslatedText></span></a>}</div></div>{sent ? <div className="success"><Check /><h3><TranslatedText>{"Inquiry received."}</TranslatedText></h3><p><TranslatedText>{"Thank you. We will respond within one business day."}</TranslatedText></p><TranslatedButton onClick={() => setSent(false)}><TranslatedText>{"Send another inquiry"}</TranslatedText></TranslatedButton></div> : <form id="inquiry-form" action={submit}><TranslatedInput className="honey" name="website" tabIndex={-1} autoComplete="off"/><div className="form-grid"><label><TranslatedText>{"Full name"}</TranslatedText><TranslatedInput name="name" required placeholder="Your name"/></label><label><TranslatedText>{"Work email"}</TranslatedText><TranslatedInput name="email" type="email" required placeholder="you@company.com"/></label><label><TranslatedText>{"Company"}</TranslatedText><TranslatedInput name="company" placeholder="Company name"/></label><label><TranslatedText>{"Country / Region"}</TranslatedText><TranslatedInput name="country" placeholder="United States"/></label><label><TranslatedText>{"Request type"}</TranslatedText><TranslatedSelect name="requestType" value={requestType} onChange={event => setRequestType(event.target.value)}><option value="Wholesale quote"><TranslatedText>{"Wholesale quote"}</TranslatedText></option><option value="Sample request"><TranslatedText>{"Sample request"}</TranslatedText></option><option value="OEM / private label project"><TranslatedText>{"OEM / private label project"}</TranslatedText></option></TranslatedSelect></label><label><TranslatedText>{"Product / inquiry list"}</TranslatedText><TranslatedInput name="product" value={selected} onChange={event => setSelected(event.target.value)} placeholder="Select products or type a product name"/></label><label><TranslatedText>{"Estimated quantity"}</TranslatedText><TranslatedInput name="quantity" placeholder={requestType === "Sample request" ? "e.g. 1–3 samples" : "e.g. 1,000 pcs"}/></label><label><TranslatedText>{"Reference file (optional)"}</TranslatedText><span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, minHeight: 44, padding: "6px 10px", background: "#fff", border: "1px solid #e5e1dc" }}><TranslatedInput ref={attachmentInput} type="file" name="attachment" accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="Reference file (optional)" style={{ display: "none" }} onChange={event => setAttachmentName(event.currentTarget.files?.[0]?.name || "")}/><TranslatedButton type="button" onClick={() => attachmentInput.current?.click()} style={{ flexShrink: 0, padding: "5px 8px", border: "1px solid #e5e1dc", background: "#fff", cursor: "pointer" }} aria-describedby="attachment-filename"><TranslatedText>{"Choose file"}</TranslatedText></TranslatedButton><span id="attachment-filename" aria-live="polite" title={attachmentName || "No file chosen"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}><TranslatedText>{attachmentName || "No file chosen"}</TranslatedText></span></span><small style={{ fontSize: 11, fontWeight: 400 }}><TranslatedText>{"No file? Leave blank. JPG, PNG, WebP or PDF \u00B7 Max 8MB."}</TranslatedText></small></label></div><label><TranslatedText>{"Requirements"}</TranslatedText><TranslatedTextarea name="message" required placeholder={requestType === "Sample request" ? "Tell us your target market and which sample you want to evaluate..." : "Use, size, material, target price, packaging or a link to your reference product..."}/></label><TranslatedButton className="primary submit"><TranslatedText>{"Send Inquiry "}</TranslatedText><ArrowRight /></TranslatedButton><small className="privacy"><TranslatedText>{"Your information is used only to respond to this inquiry."}</TranslatedText></small></form>}</section>



    <CompanyProof settings={settings}/>
    <div className={`catalog-tool-dock ${showToolDock ? "visible" : ""}`}><TranslatedButton onClick={() => setToolPanel("basket")}><ShoppingBasket /><span><TranslatedText>{"RFQ List"}</TranslatedText></span><i><TranslatedText>{Object.keys(basket).length}</TranslatedText></i></TranslatedButton><TranslatedButton onClick={() => setToolPanel("compare")}><Scale /><span><TranslatedText>{"Compare"}</TranslatedText></span><i><TranslatedText>{compare.length}</TranslatedText></i></TranslatedButton><TranslatedButton onClick={() => setToolPanel("favorites")}><Heart /><span><TranslatedText>{"Saved"}</TranslatedText></span><i><TranslatedText>{favorites.length}</TranslatedText></i></TranslatedButton></div>
    {toolPanel && <div className="catalog-tool-overlay" onClick={() => setToolPanel(null)}><aside onClick={e => e.stopPropagation()}><header><div><small><TranslatedText>{"BUYER TOOL"}</TranslatedText></small><h2><TranslatedText>{toolPanel === "basket" ? "Request for quotation list" : toolPanel === "compare" ? "Product comparison" : "Saved products"}</TranslatedText></h2></div><TranslatedButton onClick={() => setToolPanel(null)}><X /></TranslatedButton></header>{toolPanel === "basket" && <>{basketProducts.length === 0 ? <p className="tool-empty"><TranslatedText>{"Add products to build one combined inquiry."}</TranslatedText></p> : <div className="tool-list">{basketProducts.map(product => <article key={product.id}><b><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></b><label><TranslatedText>{"Qty"}</TranslatedText><TranslatedInput type="number" min="1" value={basket[product.id]} onChange={e => setBasket(items => ({ ...items, [product.id]: Number(e.target.value) }))}/></label><TranslatedButton onClick={() => setBasket(items => { const next = { ...items }; delete next[product.id]; return next; })}><Trash2 /></TranslatedButton></article>)}</div>} {basketProducts.length > 0 && <TranslatedButton className="tool-primary" onClick={useInquiryList}><TranslatedText>{"Continue to inquiry"}</TranslatedText></TranslatedButton>}</>}{toolPanel === "favorites" && <div className="tool-list">{initialProducts.filter(p => favorites.includes(p.id)).map(product => <article key={product.id}><b><TranslatedText field="name" translations={product.translations}>{product.name}</TranslatedText></b><Link href={productPath(product)}><TranslatedText>{"View"}</TranslatedText></Link><TranslatedButton onClick={() => toggleFavorite(product.id)}><Trash2 /></TranslatedButton></article>)}{favorites.length === 0 && <p className="tool-empty"><TranslatedText>{"Your saved products will appear here."}</TranslatedText></p>}</div>}{toolPanel === "compare" && <div className="compare-table">{compareProducts.length === 0 ? <p className="tool-empty"><TranslatedText>{"Choose 2\u20134 products to compare."}</TranslatedText></p> : <table><thead><tr><th><TranslatedText>{"Item"}</TranslatedText></th>{compareProducts.map(p => <th key={p.id}><TranslatedText field="name" translations={p.translations}>{p.name}</TranslatedText></th>)}</tr></thead><tbody><tr><td><TranslatedText>{"Material"}</TranslatedText></td>{compareProducts.map(p => <td key={p.id}><TranslatedText>{p.material}</TranslatedText></td>)}</tr><tr><td><TranslatedText>{"MOQ"}</TranslatedText></td>{compareProducts.map(p => <td key={p.id}><TranslatedText>{p.moq}</TranslatedText></td>)}</tr><tr><td><TranslatedText>{"Size"}</TranslatedText></td>{compareProducts.map(p => <td key={p.id}><TranslatedText>{p.size || "—"}</TranslatedText></td>)}</tr><tr><td><TranslatedText>{"Lead time"}</TranslatedText></td>{compareProducts.map(p => <td key={p.id}><TranslatedText>{p.leadTime || "—"}</TranslatedText></td>)}</tr><tr><td /><>{compareProducts.map(p => <td key={p.id}><TranslatedButton onClick={() => toggleCompare(p.id)}><TranslatedText>{"Remove"}</TranslatedText></TranslatedButton></td>)}</></tr></tbody></table>}</div>}</aside></div>}
    <div className="mobile-contact-bar" aria-label="Contact options"><a href="#contact"><Mail /><TranslatedText>{" Contact Us"}</TranslatedText></a>{settings.whatsapp.startsWith("http") && <a href={settings.whatsapp}><MessageCircle /><TranslatedText>{" WhatsApp"}</TranslatedText></a>}</div>

    <footer><a className="brand light" href="#top"><BrandMark settings={settings}/><b><TranslatedText>{settings.companyName.toUpperCase()}</TranslatedText></b><small><TranslatedText>{"CUTTING TOOLS \u00B7 OEM"}</TranslatedText></small></a><p><TranslatedText>{settings.legalName || settings.companyName}</TranslatedText><TranslatedText>{settings.address ? ` · ${settings.address}` : ""}</TranslatedText></p><div><a href="#products"><TranslatedText>{"Products"}</TranslatedText></a><Link href="/oem"><TranslatedText>{"OEM Service"}</TranslatedText></Link><Link href="/quality"><TranslatedText>{"Quality"}</TranslatedText></Link><Link href="/catalog"><TranslatedText>{"Catalog"}</TranslatedText></Link><Link href="/faq"><TranslatedText>{"FAQ"}</TranslatedText></Link><a href="#quote"><TranslatedText>{"Request Quote"}</TranslatedText></a><Link href="/privacy"><TranslatedText>{"Privacy"}</TranslatedText></Link><a href="/admin"><TranslatedText>{"Admin"}</TranslatedText></a></div><small><TranslatedText>{"\u00A9 2026 "}</TranslatedText><TranslatedText>{settings.legalName || settings.companyName}</TranslatedText><TranslatedText>{". All rights reserved."}</TranslatedText><TranslatedText>{settings.businessHours ? ` · ${settings.businessHours}` : ""}</TranslatedText></small></footer>
  </main>;
}
