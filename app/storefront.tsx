"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Facebook, Heart, Instagram, Mail, Menu, MessageCircle, PackageCheck, Scale, Scissors, ShieldCheck, ShoppingBasket, Trash2, X } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/types";
import { categorySlug } from "@/lib/slug";
import BrandMark from "./brand-mark";
import CompanyProof from "./company-proof";

const socialIcon = (name: string) => name === "Instagram" ? <Instagram /> : name === "Facebook" ? <Facebook /> : <span className="tiktok-mark">TK</span>;

export default function Storefront({ initialProducts, settings }: { initialProducts: Product[]; settings: SiteSettings }) {
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [requestType, setRequestType] = useState("Wholesale quote");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [toolPanel, setToolPanel] = useState<"basket"|"favorites"|"compare"|null>(null);
  const categories = ["All", ...Array.from(new Set(initialProducts.map(product => product.category)))];
  const products = useMemo(() => initialProducts.filter(product => (category === "All" || product.category === category) && `${product.name} ${product.category} ${product.sku || ""} ${product.material}`.toLowerCase().includes(productSearch.toLowerCase())), [category, productSearch, initialProducts]);
  const socials = [["Instagram", settings.instagram], ["Facebook", settings.facebook], ["TikTok", settings.tiktok]].filter((item): item is [string, string] => Boolean(item[1]));

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
    document.querySelector<HTMLFormElement>(".quote form")?.setAttribute("id", "inquiry-form");
    try { setFavorites(JSON.parse(localStorage.getItem("fn_favorites")||"[]")); setCompare(JSON.parse(localStorage.getItem("fn_compare")||"[]")); setBasket(JSON.parse(localStorage.getItem("fn_basket")||"{}")); } catch {}
  }, []);
  useEffect(()=>{localStorage.setItem("fn_favorites",JSON.stringify(favorites));},[favorites]);
  useEffect(()=>{localStorage.setItem("fn_compare",JSON.stringify(compare));},[compare]);
  useEffect(()=>{localStorage.setItem("fn_basket",JSON.stringify(basket));},[basket]);
  const toggleFavorite=(id:string)=>setFavorites(items=>items.includes(id)?items.filter(x=>x!==id):[...items,id]);
  const toggleCompare=(id:string)=>setCompare(items=>items.includes(id)?items.filter(x=>x!==id):items.length<4?[...items,id]:(alert("You can compare up to 4 products."),items));
  const addBasket=(id:string)=>setBasket(items=>({...items,[id]:(items[id]||0)+1}));
  const basketProducts=initialProducts.filter(product=>basket[product.id]);
  const compareProducts=initialProducts.filter(product=>compare.includes(product.id));
  const useInquiryList=()=>{const summary=basketProducts.map(product=>`${product.name} × ${basket[product.id]}`).join("; ");setSelected(summary);setRequestType("Wholesale quote");setToolPanel(null);setTimeout(()=>document.querySelector("#quote")?.scrollIntoView({behavior:"smooth"}),0);};

  async function submit(formData: FormData) {
    if (busy) return;
    setBusy(true); setSubmitError("");
    try {
      let attribution = tracking;
      try { attribution = JSON.parse(sessionStorage.getItem("fn_attribution") || JSON.stringify(tracking)); } catch {}
      Object.entries(attribution).forEach(([key, value]) => formData.set(key, String(value)));
      formData.set("visitor", sessionStorage.getItem("fn_visitor") || "");
      const response = await fetch("/api/inquiries", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Please check your email and enter at least five characters in requirements.");
      setSent(true);
      const win = window as typeof window & { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void; ttq?: { track?: (...args: unknown[]) => void } };
      win.gtag?.("event", "generate_lead", { request_type: requestType, product: selected });
      win.fbq?.("track", "Lead", { request_type: requestType, content_name: selected });
      win.ttq?.track?.("SubmitForm", { content_name: selected, description: requestType });
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to send. Please try again."); }
    finally { setBusy(false); }
  }

  const imageStyle = (product: Product) => product.image ? {
    backgroundImage: `url(${product.image})`,
    backgroundPosition: product.imagePosition || "center",
    backgroundSize: product.imagePosition ? "300% 200%" : "cover",
  } : undefined;

  return <main>
    {submitError && <div className="form-feedback" role="alert">{submitError}</div>}
    {busy && <div className="form-feedback" role="status">Sending your inquiry…</div>}
    <header className="nav">
      <a className="brand" href="#top"><BrandMark settings={settings}/><b>{settings.companyName.toUpperCase()}</b><small>TOOLS & HARDWARE</small></a>
      <nav className={menu ? "open" : ""}>
        <a href="#products">Products</a><a href="#capabilities">OEM Service</a><a href="#content">Why Us</a><Link href="/faq">FAQ</Link><a href="#about">About</a><a className="nav-quote" href="#quote">Request a Quote</a>
      </nav>
      <button className="menu" aria-label="Toggle navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </header>

    <section className="hero scissors-hero" id="top">
      <div className="hero-bg" />
      <div className="hero-copy">
        <div className="eyebrow">EASTERN CRAFT · GLOBAL HARDWARE · OEM</div>
        <h1>{settings.tagline || "Hardware products engineered for your market."}</h1>
        <p>Wholesale scissors, hand tools and hardware products for distributors, retailers and private-label brands. Product matching, packaging and inspection coordinated from China.</p>
        <div className="hero-actions"><a className="primary" href="#products">Explore Products <ArrowRight /></a><Link className="ghost" href="/catalog">View Catalog</Link><a className="ghost" href="#quote">Start an OEM Project</a></div>
        <div className="markets"><span>Built for</span><b>Distributors</b><b>Retail Brands</b><b>Industrial Buyers</b></div>
      </div>
    </section>

    <section className="trust">
      <div><PackageCheck /><b>Flexible MOQ</b><span>Samples and trial orders supported</span></div>
      <div><ShieldCheck /><b>Quality Checked</b><span>Inspection before shipment</span></div>
      <div><Scissors /><b>Private Label Ready</b><span>Logo, color and packaging options</span></div>
    </section>

    <section className="section" id="products">
      <div className="section-head"><div><span className="kicker">PRODUCT PROGRAM</span><h2>Find the right hardware product for your channel.</h2></div><p>Start with a proven model or send your target specification. Scissors, tools and other hardware can be adapted for retail, professional or promotional programs.</p></div>
      <div className="store-search"><input value={productSearch} onChange={event=>setProductSearch(event.target.value)} placeholder="Search by product, category, SKU or material..."/><span>{products.length} products found</span></div>
      <div className="filters">{categories.map(item => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="category-links"><span>Browse category pages:</span>{categories.filter(item=>item!=="All").map(item=><Link href={`/categories/${categorySlug(item)}`} key={item}>{item}</Link>)}</div>
      <div className="products">{products.map((product) => <article className="product" key={product.id}>
        <Link href={`/products/${product.id}`} className="product-art" style={imageStyle(product)} aria-label={`View ${product.name}`}><span>{String(initialProducts.findIndex(item => item.id === product.id) + 1).padStart(2, "0")}</span></Link>
        <div className="product-body"><span className="product-category">{product.category}</span><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.description}</p><dl><div><dt>Material</dt><dd>{product.material}</dd></div><div><dt>MOQ</dt><dd>{product.moq}</dd></div></dl><div className="product-card-tools"><button className={favorites.includes(product.id)?"selected":""} onClick={()=>toggleFavorite(product.id)} title="Save product"><Heart/> Save</button><button className={compare.includes(product.id)?"selected":""} onClick={()=>toggleCompare(product.id)} title="Compare product"><Scale/> Compare</button><button className={basket[product.id]?"selected":""} onClick={()=>addBasket(product.id)} title="Add to inquiry list"><ShoppingBasket/> Add to RFQ</button></div><div className="product-foot"><b>{product.price}</b><Link href={`/products/${product.id}`}>Details <ArrowRight /></Link></div></div>
      </article>)}</div>
    </section>

    <section className="capabilities" id="capabilities"><div><span className="kicker">FROM IDEA TO RETAIL SHELF</span><h2>Your private-label cutting tool partner.</h2><p>We coordinate product matching, samples, logo application, packaging, inspection and export delivery through one point of contact.</p><a href="#quote">Discuss your program <ArrowRight /></a></div><ol><li><span>01</span><div><b>Product & market brief</b><p>Tell us your target users, price point, sales channel and destination market.</p></div></li><li><span>02</span><div><b>Sample & packaging</b><p>Confirm the cutting performance, handle, logo and retail presentation before production.</p></div></li><li><span>03</span><div><b>Inspection & export</b><p>Production follow-up, pre-shipment checks and export-ready packing.</p></div></li></ol></section>

    <section className="content-section" id="content"><div className="section-head"><div><span className="kicker">PROOF YOU CAN SEE</span><h2>Built to be tested, compared and trusted.</h2></div><p>Ask for product videos, cutting tests, packaging previews and inspection photos before placing a production order.</p></div><div className="content-grid"><article><b>01</b><h3>Cutting tests</h3><p>See the tool working on the material your customers actually cut.</p></article><article><b>02</b><h3>OEM previews</h3><p>Review logo position, colors and packaging before mass production.</p></article><article><b>03</b><h3>Inspection records</h3><p>Receive clear photos and checkpoints before the goods leave China.</p></article></div></section>

    <section className="about" id="about"><span className="kicker">{settings.companyName.toUpperCase()}</span><h2>Industrial discipline.<br />Personal service.</h2><p>{settings.about}</p><div className="stats"><div><b>24h</b><span>Typical quote response</span></div><div><b>OEM</b><span>Logo and packaging support</span></div><div><b>1-to-1</b><span>Direct project contact</span></div></div>{socials.length > 0 && <div className="social-links">{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{socialIcon(name)} {name}</a>)}</div>}</section>

    <section className="quote" id="quote"><div className="quote-intro"><span className="kicker">START A SOURCING CONVERSATION</span><h2>Tell us what you want to sell.</h2><p>Share a reference product, target price, expected quantity or destination market. We will respond with practical options and the questions needed for a reliable quote.</p><div className="contact-cards" id="contact"><a href={`mailto:${settings.email}`}><Mail /><span><small>Email</small>{settings.email}</span></a><a href={settings.whatsapp.startsWith("http") ? settings.whatsapp : "#quote"}><MessageCircle /><span><small>WhatsApp</small>{settings.whatsapp}</span></a><a href="#quote"><MessageCircle /><span><small>WeChat</small>{settings.wechat}</span></a></div></div>{sent ? <div className="success"><Check /><h3>Inquiry received.</h3><p>Thank you. We will respond within one business day.</p><button onClick={() => setSent(false)}>Send another inquiry</button></div> : <form action={submit}><input className="honey" name="website" tabIndex={-1} autoComplete="off" /><div className="form-grid"><label>Full name<input name="name" required placeholder="Your name" /></label><label>Work email<input name="email" type="email" required placeholder="you@company.com" /></label><label>Company<input name="company" placeholder="Company name" /></label><label>Country / Region<input name="country" placeholder="United States" /></label><label>Request type<select name="requestType" value={requestType} onChange={event => setRequestType(event.target.value)}><option>Wholesale quote</option><option>Sample request</option><option>OEM / private label project</option></select></label><label>Product / inquiry list<input name="product" value={selected} onChange={event => setSelected(event.target.value)} placeholder="Select products or type a product name" /></label><label>Estimated quantity<input name="quantity" placeholder={requestType === "Sample request" ? "e.g. 1–3 samples" : "e.g. 1,000 pcs"} /></label></div><label>Requirements<textarea name="message" required placeholder={requestType === "Sample request" ? "Tell us your target market and which sample you want to evaluate..." : "Use, size, material, target price, packaging or a link to your reference product..."} /></label><button className="primary submit">Send Inquiry <ArrowRight /></button><small className="privacy">Your information is used only to respond to this inquiry.</small></form>}</section>

    <div className="reference-upload"><div><b>Have a drawing or reference product?</b><span>Optional: attach one JPG, PNG, WebP or PDF file, up to 8MB.</span></div><input form="inquiry-form" type="file" name="attachment" accept="image/jpeg,image/png,image/webp,application/pdf" /><button type="button" onClick={()=>document.querySelector<HTMLFormElement>("#inquiry-form")?.requestSubmit()}>Submit with attachment</button></div>

    <CompanyProof settings={settings}/>
    <div className="catalog-tool-dock"><button onClick={()=>setToolPanel("basket")}><ShoppingBasket/><span>RFQ List</span><i>{Object.keys(basket).length}</i></button><button onClick={()=>setToolPanel("compare")}><Scale/><span>Compare</span><i>{compare.length}</i></button><button onClick={()=>setToolPanel("favorites")}><Heart/><span>Saved</span><i>{favorites.length}</i></button></div>
    {toolPanel&&<div className="catalog-tool-overlay" onClick={()=>setToolPanel(null)}><aside onClick={e=>e.stopPropagation()}><header><div><small>BUYER TOOL</small><h2>{toolPanel==="basket"?"Request for quotation list":toolPanel==="compare"?"Product comparison":"Saved products"}</h2></div><button onClick={()=>setToolPanel(null)}><X/></button></header>{toolPanel==="basket"&&<>{basketProducts.length===0?<p className="tool-empty">Add products to build one combined inquiry.</p>:<div className="tool-list">{basketProducts.map(product=><article key={product.id}><b>{product.name}</b><label>Qty<input type="number" min="1" value={basket[product.id]} onChange={e=>setBasket(items=>({...items,[product.id]:Number(e.target.value)}))}/></label><button onClick={()=>setBasket(items=>{const next={...items};delete next[product.id];return next;})}><Trash2/></button></article>)}</div>} {basketProducts.length>0&&<button className="tool-primary" onClick={useInquiryList}>Continue to inquiry</button>}</>}{toolPanel==="favorites"&&<div className="tool-list">{initialProducts.filter(p=>favorites.includes(p.id)).map(product=><article key={product.id}><b>{product.name}</b><Link href={`/products/${product.id}`}>View</Link><button onClick={()=>toggleFavorite(product.id)}><Trash2/></button></article>)}{favorites.length===0&&<p className="tool-empty">Your saved products will appear here.</p>}</div>}{toolPanel==="compare"&&<div className="compare-table">{compareProducts.length===0?<p className="tool-empty">Choose 2–4 products to compare.</p>:<table><thead><tr><th>Item</th>{compareProducts.map(p=><th key={p.id}>{p.name}</th>)}</tr></thead><tbody><tr><td>Material</td>{compareProducts.map(p=><td key={p.id}>{p.material}</td>)}</tr><tr><td>MOQ</td>{compareProducts.map(p=><td key={p.id}>{p.moq}</td>)}</tr><tr><td>Size</td>{compareProducts.map(p=><td key={p.id}>{p.size||"—"}</td>)}</tr><tr><td>Lead time</td>{compareProducts.map(p=><td key={p.id}>{p.leadTime||"—"}</td>)}</tr><tr><td/><>{compareProducts.map(p=><td key={p.id}><button onClick={()=>toggleCompare(p.id)}>Remove</button></td>)}</></tr></tbody></table>}</div>}</aside></div>}
    <div className="mobile-contact-bar"><a href="#quote">Get a Quote</a><a href={settings.whatsapp.startsWith("http") ? settings.whatsapp : "#quote"}><MessageCircle /> WhatsApp</a></div>

    <footer><a className="brand light" href="#top"><BrandMark settings={settings}/><b>{settings.companyName.toUpperCase()}</b><small>TOOLS & HARDWARE</small></a><p>{settings.legalName||settings.companyName}{settings.address?` · ${settings.address}`:""}</p><div><a href="#products">Products</a><Link href="/catalog">Catalog</Link><Link href="/faq">FAQ</Link><a href="#quote">Request Quote</a><Link href="/privacy">Privacy</Link><a href="/admin">Admin</a></div><small>© 2026 {settings.legalName||settings.companyName}. All rights reserved.{settings.businessHours?` · ${settings.businessHours}`:""}</small></footer>
  </main>;
}
