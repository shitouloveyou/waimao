"use client";
import { useState } from "react";
import type { EventRecord } from "@/lib/operations";
import type { Inquiry, Product, SalesOrder, SiteSettings } from "@/lib/types";

export type DeploymentReadiness = { siteUrl: boolean; emailNotifications: boolean; secureAdminPassword: boolean; secureSession: boolean };

export default function Operations({ events, inquiries, orders, products, settings, readiness }: { events: EventRecord[]; inquiries: Inquiry[]; orders: SalesOrder[]; products: Product[]; settings: SiteSettings; readiness: DeploymentReadiness }) {
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
  const activeProducts = products.filter(item => item.active !== false);
  const today = new Date().toISOString().slice(0,10);
  const followupsDue = inquiries.filter(item=>item.followUp&&item.followUp<=today&&!['已成交','无效'].includes(item.stage||"新询盘")).length;
  const orderDelays = orders.filter(item=>!['已签收','已完成','暂停'].includes(item.stage)&&((item.productionDue&&item.productionDue<today)||(item.shippingDue&&item.shippingDue<today))).length;
  const receivable = orders.filter(item=>(item.currency||"USD")==="USD").reduce((sum,item)=>sum+Math.max(0,item.amount-item.paid),0);
  const checks = [
    ["正式域名与 SITE_URL", readiness.siteUrl, "购买域名后在服务器设置 SITE_URL"],
    ["业务联系邮箱", Boolean(settings.email && !settings.email.endsWith("@example.com")), "在网站设置中填写正式邮箱"],
    ["WhatsApp 联系链接", settings.whatsapp.startsWith("http"), "填写完整的 https://wa.me/... 链接"],
    ["询盘邮件通知", readiness.emailNotifications, "配置 RESEND_API_KEY 和 NOTIFY_EMAIL"],
    ["后台强密码", readiness.secureAdminPassword, "在服务器设置新的 ADMIN_PASSWORD"],
    ["登录会话密钥", readiness.secureSession, "在服务器设置随机 SESSION_SECRET"],
    ["访问或广告统计", Boolean(settings.googleAnalyticsId || settings.metaPixelId || settings.tiktokPixelId), "至少配置一个统计平台"],
    ["公司 Logo", Boolean(settings.logo), "在网站设置中上传正式 Logo"],
    ["公司主体信息", Boolean(settings.legalName && settings.address), "填写法定公司名和地址"],
    ["公司实力信息", Boolean(settings.companyImages?.length && (settings.qualityProcess || settings.certifications)), "上传真实照片并填写质检或认证信息"],
    ["已上架产品", activeProducts.length >= 3, "建议至少准备 3 个完整产品"],
    ["独立产品图片", activeProducts.some(item => item.image && item.image !== "/scissors-catalog.png"), "上传真实产品主图和细节图"],
  ] as const;
  const readinessScore = Math.round(checks.filter(([,done])=>done).length / checks.length * 100);
  return <div className="operations">
    <header><h1>运营中心</h1><select value={days} onChange={event => setDays(event.target.value)}><option value="7">最近7天</option><option value="30">最近30天</option><option value="90">最近90天</option></select></header>
    <div className="metrics">{[["页面浏览", views.length], ["访问会话", visitors], ["产品点击", clicks], ["WhatsApp 点击", whatsapp], ["有效提交", leads], ["询盘转化率", rate(leads)]].map(([label, value]) => <article key={label}><small>{label}</small><strong>{value}</strong></article>)}</div>
    <div className="business-alerts"><article className={followupsDue?"warn":""}><small>到期客户跟进</small><b>{followupsDue}</b><span>{followupsDue?"请到客户管理处理":"目前没有到期任务"}</span></article><article className={orderDelays?"danger":""}><small>可能延期订单</small><b>{orderDelays}</b><span>{orderDelays?"请检查生产和发货计划":"订单计划正常"}</span></article><article className={receivable?"warn":""}><small>USD 未收余额</small><b>{receivable.toLocaleString()}</b><span>发货前核对付款条款</span></article></div>
    <p>产品点击率：{views.length ? (clicks / views.length * 100).toFixed(1) + "%" : "—"}（产品点击次数 ÷ 页面浏览次数）。访问会话按浏览器标签页识别，刷新会增加页面浏览；这不是社媒广告曝光点击率。统计从本次更新后开始。</p>
    <section className="readiness"><div className="readiness-head"><div><h2>正式上线准备度</h2><p>购买域名和迁移服务器前，按此清单逐项完成。</p></div><strong>{readinessScore}%</strong></div><div className="readiness-bar"><i style={{width:`${readinessScore}%`}}/></div><div className="readiness-list">{checks.map(([label,done,hint])=><div className={done?"done":"todo"} key={label}><b>{done?"✓":"!"}</b><span><strong>{label}</strong><small>{done?"已完成":hint}</small></span></div>)}</div></section>
    <div className="ops-columns"><article><h2>来源浏览量</h2>{Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,15).map(([name, count]) => <div className="metric-row" key={name}><span>{name}</span><b>{count}</b></div>)}</article><article><h2>热门页面</h2>{Object.entries(pages).sort((a,b) => b[1]-a[1]).slice(0,15).map(([name, count]) => <div className="metric-row" key={name}><span>{name}</span><b>{count}</b></div>)}</article></div>
    <article className="link-builder"><h2>生成社媒推广链接</h2><div className="admin-grid"><label>网站正式地址<input value={base} onChange={event => setBase(event.target.value)} placeholder="https://your-domain.com" /></label><label>平台<select value={source} onChange={event => setSource(event.target.value)}><option>tiktok</option><option>facebook</option><option>instagram</option><option>youtube</option></select></label><label>内容/活动名称<input value={campaign} onChange={event => setCampaign(event.target.value)} /></label><label>落地产品<select value={product} onChange={event => setProduct(event.target.value)}><option value="">首页</option>{products.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><p className="landing-url">{link || "填入网站地址即可生成链接"}</p><button disabled={!link} onClick={async () => { try { await navigator.clipboard.writeText(link); setCopied(true); } catch { alert("复制失败，请手动选择链接复制"); } }}>{copied ? "已复制" : "复制推广链接"}</button></article>
  </div>;
}
