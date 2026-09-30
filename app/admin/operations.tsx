"use client";
import { useState } from "react";
import type { EventRecord } from "@/lib/operations";
import type { Inquiry, Product } from "@/lib/types";

export default function Operations({ events, inquiries, products }: { events: EventRecord[]; inquiries: Inquiry[]; products: Product[] }) {
  const [days, setDays] = useState("30");
  const [source, setSource] = useState("tiktok");
  const [campaign, setCampaign] = useState("cutting-test");
  const [product, setProduct] = useState(products[0]?.id || "");
  const [base, setBase] = useState("");
  const [copied, setCopied] = useState(false);
  const cutoff = Date.now() - Number(days) * 86400000;
  const rows = events.filter(event => Date.parse(event.createdAt) >= cutoff);
  const views = rows.filter(event => event.type === "view");
  const visitors = new Set(views.map(event => event.visitor)).size;
  const clicks = rows.filter(event => event.type === "product_click").length;
  const whatsapp = rows.filter(event => event.type === "whatsapp").length;
  const leads = inquiries.filter(inquiry => Date.parse(inquiry.createdAt) >= cutoff).length;
  const rate = (count: number) => visitors ? (count / visitors * 100).toFixed(1) + "%" : "—";
  const counts: Record<string, number> = {};
  views.forEach(event => { counts[event.source] = (counts[event.source] || 0) + 1; });
  const pages: Record<string, number> = {};
  views.forEach(event => { pages[event.page] = (pages[event.page] || 0) + 1; });
  const link = base ? base.replace(/\/$/, "") + (product ? "/products/" + product : "/") + "?utm_source=" + encodeURIComponent(source) + "&utm_medium=organic&utm_campaign=" + encodeURIComponent(campaign) : "";
  return <div className="operations">
    <header><h1>运营中心</h1><select value={days} onChange={event => setDays(event.target.value)}><option value="7">最近7天</option><option value="30">最近30天</option><option value="90">最近90天</option></select></header>
    <div className="metrics">{[["页面浏览", views.length], ["访问会话", visitors], ["产品点击", clicks], ["WhatsApp 点击", whatsapp], ["有效提交", leads], ["询盘转化率", rate(leads)]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>
    <p>产品点击率：{views.length ? (clicks / views.length * 100).toFixed(1) + "%" : "—"}（产品点击次数 ÷ 页面浏览次数）。访问会话按浏览器标签页识别，刷新会增加页面浏览；这不是社媒广告曝光点击率。统计从本次更新后开始。</p>
    <div className="ops-columns"><article><h2>来源浏览量</h2>{Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,15).map(([name, count]) => <div className="metric-row" key={name}><span>{name}</span><b>{count}</b></div>)}</article><article><h2>热门页面</h2>{Object.entries(pages).sort((a,b) => b[1]-a[1]).slice(0,15).map(([name, count]) => <div className="metric-row" key={name}><span>{name}</span><b>{count}</b></div>)}</article></div>
    <article className="link-builder"><h2>生成社媒推广链接</h2><div className="admin-grid"><label>网站正式地址<input value={base} onChange={event => setBase(event.target.value)} placeholder="https://your-domain.com" /></label><label>平台<select value={source} onChange={event => setSource(event.target.value)}><option>tiktok</option><option>facebook</option><option>instagram</option><option>youtube</option></select></label><label>内容/活动名称<input value={campaign} onChange={event => setCampaign(event.target.value)} /></label><label>落地产品<select value={product} onChange={event => setProduct(event.target.value)}><option value="">首页</option>{products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><p className="landing-url">{link || "填入网站地址即可生成链接"}</p><button disabled={!link} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { alert("复制失败，请手动选择链接复制"); } }}>{copied ? "已复制" : "复制推广链接"}</button></article>
  </div>;
}
