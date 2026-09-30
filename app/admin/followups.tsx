"use client";
import { useState } from "react";
import type { Inquiry } from "@/lib/types";
export default function Followups({ inquiries }: { inquiries: Inquiry[] }) {
  const [rows, setRows] = useState(inquiries);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const update = (id: string, key: string, value: string) => setRows(items => items.map(item => item.id === id ? { ...item, [key]: value } : item));
  async function save(item: Inquiry) {
    try { const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, stage: item.stage || "新询盘", notes: item.notes, followUp: item.followUp }) }); if (!response.ok) throw new Error(); setMessage("跟进记录已保存"); } catch { setMessage("保存失败，请重试"); }
  }
  return <section className="followups"><h2>询盘跟进</h2><input placeholder="搜索客户、邮箱或产品" value={search} onChange={event => setSearch(event.target.value)} /><p role="status">{message}</p>{rows.filter(item => [item.name,item.email,item.product,item.company].join(" ").toLowerCase().includes(search.toLowerCase())).map(item => <article key={item.id}><b>{item.name || item.email} · {item.product}</b><div className="admin-grid"><label>状态<select value={item.stage || "新询盘"} onChange={event => update(item.id,"stage",event.target.value)}>{["新询盘","已联系","已报价","已成交","无效"].map(stage => <option key={stage}>{stage}</option>)}</select></label><label>下次跟进<input type="date" value={item.followUp || ""} onChange={event => update(item.id,"followUp",event.target.value)} /></label><label className="wide">跟进备注<textarea value={item.notes || ""} onChange={event => update(item.id,"notes",event.target.value)} /></label></div><button onClick={() => save(item)}>保存跟进</button></article>)}</section>;
}
