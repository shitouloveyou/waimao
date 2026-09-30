"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, Plus, Printer, Trash2, Truck } from "lucide-react";
import type { Inquiry, Product, SiteSettings } from "@/lib/types";

type Line = { id: string; description: string; quantity: number; unitPrice: number };
const money = (value: number, currency: string) => `${currency} ${Number.isFinite(value) ? value.toFixed(2) : "0.00"}`;

export function QuoteManager({ inquiries, products, settings }: { inquiries: Inquiry[]; products: Product[]; settings: SiteSettings }) {
  const [inquiryId, setInquiryId] = useState("");
  const [customer, setCustomer] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [tradeTerm, setTradeTerm] = useState("FOB");
  const [validity, setValidity] = useState("15 days");
  const [lines, setLines] = useState<Line[]>([{ id: crypto.randomUUID(), description: products[0]?.name || "Product", quantity: 1000, unitPrice: 0 }]);
  const [freight, setFreight] = useState(0), [insurance, setInsurance] = useState(0), [other, setOther] = useState(0);
  const subtotal = lines.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);
  const total = subtotal + freight + insurance + other;
  function chooseInquiry(id: string) { const item = inquiries.find(q => q.id === id); setInquiryId(id); if (!item) return; setCustomer(item.company || item.name); setEmail(item.email); setCountry(item.country); setLines([{ id: crypto.randomUUID(), description: item.product || products[0]?.name || "Product", quantity: Number((item.quantity || "").replace(/[^0-9.]/g, "")) || 1, unitPrice: 0 }]); }
  function updateLine(id: string, patch: Partial<Line>) { setLines(items => items.map(item => item.id === id ? { ...item, ...patch } : item)); }
  return <div className="trade-tool-page">
    <header><div><small>QUOTATION</small><h1>报价单生成与打印</h1><p>从询盘带入客户资料，补充单价、贸易条款和物流费用后即可打印或另存为 PDF。</p></div><button className="save no-print" onClick={()=>window.print()}><Printer/> 打印 / 保存 PDF</button></header>
    <section className="quote-sheet">
      <div className="quote-letterhead"><div><b>{settings.companyName}</b><span>{settings.legalName || settings.companyName}</span><span>{settings.email}</span></div><div><strong>QUOTATION</strong><span>No. Q-{new Date().toISOString().slice(0,10).replaceAll("-","")}</span><span>{new Date().toLocaleDateString("en-CA")}</span></div></div>
      <div className="quote-fields no-print"><label>从客户询盘带入<select value={inquiryId} onChange={e=>chooseInquiry(e.target.value)}><option value="">手动填写</option>{inquiries.map(q=><option value={q.id} key={q.id}>{q.company||q.name} · {q.product||"未指定产品"}</option>)}</select></label><label>客户 / 公司<input value={customer} onChange={e=>setCustomer(e.target.value)}/></label><label>邮箱<input value={email} onChange={e=>setEmail(e.target.value)}/></label><label>国家<input value={country} onChange={e=>setCountry(e.target.value)}/></label></div>
      <div className="quote-customer"><div><small>QUOTED TO</small><b>{customer || "Customer / Company"}</b><span>{email || "Email"}</span><span>{country || "Country / Region"}</span></div><div><label>币种<select value={currency} onChange={e=>setCurrency(e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>CNY</option></select></label><label>贸易条款<select value={tradeTerm} onChange={e=>setTradeTerm(e.target.value)}><option>EXW</option><option>FOB</option><option>CIF</option><option>DDP</option><option>DAP</option></select></label><label>有效期<input value={validity} onChange={e=>setValidity(e.target.value)}/></label></div></div>
      <div className="quote-lines"><div className="quote-row quote-row-head"><span>产品说明</span><span>数量</span><span>单价</span><span>金额</span><span className="no-print"/></div>{lines.map(line=><div className="quote-row" key={line.id}><select value={line.description} onChange={e=>updateLine(line.id,{description:e.target.value})}><option value={line.description}>{line.description}</option>{products.filter(p=>p.name!==line.description).map(p=><option key={p.id}>{p.name}</option>)}</select><input type="number" min="0" value={line.quantity} onChange={e=>updateLine(line.id,{quantity:Number(e.target.value)})}/><input type="number" min="0" step="0.001" value={line.unitPrice} onChange={e=>updateLine(line.id,{unitPrice:Number(e.target.value)})}/><b>{money(line.quantity*line.unitPrice,currency)}</b><button className="no-print" onClick={()=>setLines(items=>items.filter(item=>item.id!==line.id))}><Trash2/></button></div>)}</div>
      <button className="line-add no-print" onClick={()=>setLines(items=>[...items,{id:crypto.randomUUID(),description:products[0]?.name||"Product",quantity:1,unitPrice:0}])}><Plus/> 增加产品行</button>
      <div className="quote-totals"><label>产品小计 <b>{money(subtotal,currency)}</b></label><label>预估运费<input type="number" min="0" value={freight} onChange={e=>setFreight(Number(e.target.value))}/></label><label>保险费<input type="number" min="0" value={insurance} onChange={e=>setInsurance(Number(e.target.value))}/></label><label>其他费用<input type="number" min="0" value={other} onChange={e=>setOther(Number(e.target.value))}/></label><strong>报价总额 <span>{money(total,currency)}</span></strong></div>
      <div className="quote-notes"><b>Terms & Notes</b><p>Incoterm: {tradeTerm} · Validity: {validity}. Freight is an estimate and should be reconfirmed before order confirmation. Bank charges, import duties and destination taxes are excluded unless explicitly stated.</p><small>报价前请再次确认产品规格、包装、计费重量、目的地邮编和贸易条款。</small></div>
    </section>
  </div>;
}

export function LogisticsManager() {
  const [mode,setMode]=useState("国际快递"), [length,setLength]=useState(0), [width,setWidth]=useState(0), [height,setHeight]=useState(0), [cartons,setCartons]=useState(1), [weight,setWeight]=useState(0), [divisor,setDivisor]=useState(5000), [rate,setRate]=useState(0), [productCost,setProductCost]=useState(0), [packing,setPacking]=useState(0), [domestic,setDomestic]=useState(0), [customs,setCustoms]=useState(0), [insurance,setInsurance]=useState(0), [fees,setFees]=useState(0), [revenue,setRevenue]=useState(0);
  const volumeCbm = length*width*height*cartons/1_000_000;
  const volumeWeight = length*width*height*cartons/divisor;
  const chargeable = mode === "海运" ? volumeCbm : Math.max(weight,volumeWeight);
  const freight = chargeable*rate;
  const totalCost = productCost+packing+domestic+customs+insurance+fees+freight;
  const profit = revenue-totalCost;
  const margin = revenue ? profit/revenue*100 : 0;
  function selectMode(value:string){setMode(value);if(value==="国际快递")setDivisor(5000);if(value==="空运")setDivisor(6000);}
  return <div className="trade-tool-page">
    <header><div><small>LOGISTICS CONTROL</small><h1>物流测算与防亏清单</h1><p>先向货代确认报价口径，再把所有成本填全。这里用于预估，最终以货代书面账单和海关要求为准。</p></div><button className="save no-print" onClick={()=>window.print()}><Printer/> 打印测算</button></header>
    <div className="logistics-guide"><article><b>1. 拿齐货物数据</b><p>包装后单箱长宽高、箱数、总实重、品名、材质、HS 编码。</p></article><article><b>2. 询价时说完整</b><p>目的国、城市、邮编、是否带电/磁/液体、贸易条款、是否送门。</p></article><article><b>3. 至少问三家货代</b><p>要求拆分运费、报关、提货、目的港和偏远附加费，并确认有效期。</p></article><article><b>4. 收款前复核</b><p>确认计费重和包装，预留汇率与附加费缓冲，不能只看每公斤价格。</p></article></div>
    <section className="logistics-card">
      <div className="logistics-grid"><label>运输方式<select value={mode} onChange={e=>selectMode(e.target.value)}><option>国际快递</option><option>空运</option><option>海运</option><option>铁路 / 卡航</option></select></label><label>单箱长（cm）<input type="number" min="0" value={length} onChange={e=>setLength(Number(e.target.value))}/></label><label>宽（cm）<input type="number" min="0" value={width} onChange={e=>setWidth(Number(e.target.value))}/></label><label>高（cm）<input type="number" min="0" value={height} onChange={e=>setHeight(Number(e.target.value))}/></label><label>箱数<input type="number" min="1" value={cartons} onChange={e=>setCartons(Number(e.target.value))}/></label><label>总实重（kg）<input type="number" min="0" value={weight} onChange={e=>setWeight(Number(e.target.value))}/></label><label>体积重除数<input type="number" value={divisor} onChange={e=>setDivisor(Number(e.target.value))}/><small>快递常见 5000，空运常见 6000，必须向货代确认</small></label><label>{mode==="海运"?"每立方运价":"每 kg 运价"}（报价币种）<input type="number" min="0" value={rate} onChange={e=>setRate(Number(e.target.value))}/></label></div>
      <div className="shipping-results"><div><span>总体积</span><b>{volumeCbm.toFixed(3)} m³</b></div><div><span>体积重</span><b>{volumeWeight.toFixed(2)} kg</b></div><div><span>计费依据</span><b>{mode==="海运"?`${chargeable.toFixed(3)} m³`:`${chargeable.toFixed(2)} kg`}</b></div><div><span>预估主运费</span><b>{freight.toFixed(2)}</b></div></div>
    </section>
    <section className="logistics-card"><h2>订单完整成本与利润</h2><div className="cost-grid">{[["货物采购/生产成本",productCost,setProductCost],["包装与贴标",packing,setPacking],["国内提货/送仓",domestic,setDomestic],["报关/文件/港杂",customs,setCustoms],["保险",insurance,setInsurance],["收款/平台/汇兑费用",fees,setFees],["客户支付总额",revenue,setRevenue]] .map(([label,value,setter])=><label key={String(label)}>{String(label)}<input type="number" min="0" value={Number(value)} onChange={e=>(setter as (n:number)=>void)(Number(e.target.value))}/></label>)}</div><div className={`profit-result ${profit<0?"loss":""}`}><div><span>总成本（含预估主运费）</span><b>{totalCost.toFixed(2)}</b></div><div><span>预计利润</span><b>{profit.toFixed(2)}</b></div><div><span>利润率</span><b>{margin.toFixed(1)}%</b></div></div>{profit<0&&<div className="loss-warning"><AlertTriangle/> 当前测算会亏损，请提高报价或重新确认产品、包装和物流成本。</div>}</section>
    <section className="logistics-checklist"><h2><Truck/> 找货代时直接照着问</h2><ul><li>这是门到门、港到港还是机场到机场？包含提货和派送吗？</li><li>按实重、体积重还是立方计费？体积重除数是多少？最低收费是多少？</li><li>是否包含报关费、文件费、燃油费、旺季费、偏远费和目的港费用？</li><li>报价有效到哪一天？预计时效是工作日还是自然日？</li><li>货物是否需要认证、商检或特殊包装？HS 编码和申报要素是否确认？</li><li>丢件、破损、延误如何赔付？是否需要单独购买货运保险？</li><li>DDP 报价是否真的包含关税与进口税？由谁作为进口商？</li></ul><p><b>重要：</b>首次发货建议小批量试单；没有确认最终包装尺寸前，不要向客户承诺固定运费。</p></section>
  </div>;
}
