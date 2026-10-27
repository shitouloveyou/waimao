import Link from "next/link";
import type { Product, SiteSettings } from "@/lib/types";
import {copy, type Locale} from "@/lib/languages";
import {translatedProduct} from "@/lib/localized-products";
import {productPath,productImageStyle} from "@/lib/product-presentation";
import LocalizedInquiry from "./localized-inquiry";
import ProductGallery from "./products/[id]/product-gallery";
export default function LocalizedStore({locale,products,settings,product}:{locale:Locale;products:Product[];settings:SiteSettings;product?:Product}) {
  const t=copy[locale],home=`/${locale}`,local=product?translatedProduct(product,locale):null;
  const images=product?[product.image,...(product.images||[])].filter((item,index,all):item is string=>Boolean(item)&&all.indexOf(item)===index):[];
  const garden=products.length>0&&products.every(item=>item.category==="Garden Tools");
  return <main className="locale-site" lang={locale}>
    <header className="locale-header"><Link href={home} className="locale-brand">{settings.companyName}</Link><nav><Link href={`${home}#products`}>{t.products}</Link><Link href={`${home}#about`}>{t.about}</Link><a href="#quote">{t.quote}</a></nav></header>
    {product&&local?<>
      <nav className="locale-breadcrumb"><Link href={home}>{t.home}</Link><span> / </span><span>{local.name}</span></nav>
      <section className="locale-product"><ProductGallery images={images} name={local.name} initialPosition={product.imagePosition}/><div><span className="kicker">{local.category}</span><h1>{local.name}</h1><p>{local.description||t.intro}</p><p className="locale-reference">{t.originalName}: {product.name}{product.sku?` · ${product.sku}`:""}</p><a className="primary" href="#quote">{t.quote}</a><dl>{[[t.material,local.material],[t.model,product.model],[t.size,product.size||t.confirmed],[t.moq,product.moq||t.confirmed],[t.lead,product.leadTime||t.confirmed]].filter(([,value])=>value).map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></div></section>
      <section className="locale-original" lang="en"><h2 lang={locale}>{t.original}</h2><p lang={locale}>{t.originalNote}</p>{!local.description&&<p>{product.description}</p>}{product.blade&&<p><b>Blade / Finish: </b>{product.blade}</p>}{product.packaging&&<p><b>Packaging: </b>{product.packaging}</p>}{product.applications&&<p><b>Applications: </b>{product.applications}</p>}{product.customization&&<p><b>Order options: </b>{product.customization}</p>}{product.features&&<ul>{product.features.split("|").filter(Boolean).map(item=><li key={item}>{item}</li>)}</ul>}{product.specifications&&<p style={{whiteSpace:"pre-line"}}>{product.specifications}</p>}</section>
    </>:<section className="locale-hero"><div><span className="kicker">{settings.companyName.toUpperCase()}</span><h1>{garden?t.gardenTitle:t.title}</h1><p>{t.intro}</p><a className="primary" href="#products">{t.products}</a></div>{(settings.heroImages?.[0]||settings.heroImage||products[0]?.image)&&<img src={settings.heroImages?.[0]||settings.heroImage||products[0]?.image} alt={garden?t.gardenTitle:t.title}/>}</section>}
    <section id="products" className="locale-catalog"><h2>{product?t.more:t.products}</h2><div className="locale-products">{products.filter(item=>item.id!==product?.id).map(item=>{const local=translatedProduct(item,locale);return <article key={item.id}><Link href={`/${locale}${productPath(item)}`}><span className="locale-product-photo" style={productImageStyle(item)}/><small>{local.category}</small><h3>{local.name}</h3></Link><p>{t.material}: {local.material}</p><Link className="locale-detail-link" href={`/${locale}${productPath(item)}`}>{t.details} →</Link></article>;})}</div>{!products.length&&<p>{t.empty}</p>}</section>
    <section id="about" className="locale-about"><h2>{t.about}</h2><p>{t.aboutText}</p>{settings.legalName&&<p>{settings.legalName}</p>}{settings.address&&<p>{settings.address}</p>}</section>
    <section id="quote" className="locale-quote"><div><span className="kicker">{t.contact}</span><h2>{t.quote}</h2><p>{t.intro}</p>{settings.email&&<a href={`mailto:${settings.email}`}>{settings.email}</a>}{/^https:\/\/(wa.me|api.whatsapp.com|www.whatsapp.com)\//.test(settings.whatsapp)&&<a href={settings.whatsapp}>WhatsApp</a>}</div><LocalizedInquiry key={product?.id||"home"} locale={locale} product={product?.name}/></section>
    <footer className="locale-footer"><b>{settings.companyName}</b><p>{t.footer}</p><Link href="/privacy" lang="en">{t.privacyLink}</Link><Link href="/">English</Link></footer>
  </main>;
}
