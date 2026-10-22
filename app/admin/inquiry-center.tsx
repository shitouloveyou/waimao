"use client";
import { useState } from "react";
import { Inbox } from "lucide-react";
import type { Inquiry } from "@/lib/types";

export default function InquiryCenter({ inquiries, onChange }: { inquiries: Inquiry[]; onChange: (items: Inquiry[]) => void }) {
  const [filter, setFilter] = useState("all");
  const [pending, setPending] = useState<string[]>([]);
  const [error, setError] = useState("");
  const unread = inquiries.filter(item => !item.viewedAt).length;
  const rows = inquiries.filter(item => filter === "all" || (filter === "unread" ? !item.viewedAt : Boolean(item.viewedAt)));
  async function mark(item: Inquiry) {
    setPending(ids => [...ids, item.id]); setError("");
    try {
      const response = await fetch("/api/admin/inquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, action: "viewed", viewed: !item.viewedAt }) });
      if (!response.ok) throw new Error();
      const result = await response.json();
      onChange(inquiries.map(row => row.id === item.id ? { ...row, viewedAt: result.viewedAt } : row));
    } catch { setError("查看状态保存失败，请检查登录状态后重试。"); }
    finally { setPending(ids => ids.filter(id => id !== item.id)); }
  }
  return <>
    <header><div><small>INQUIRY CENTER</small><h1>客户询盘</h1><p>共 {inquiries.length} 条，未查看 {unread} 条。查看后请手动标记；业务跟进请到“客户管理”。</p></div></header>
    <div className="inquiry-filters" aria-label="询盘查看状态">{[["all", "全部"], ["unread", "未查看"], ["read", "已查看"]].map(([value, title]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{title}</button>)}</div>
    {error && <p role="alert">{error}</p>}
    <div className="inquiries">{rows.length === 0 ? <div className="empty"><Inbox/><h3>暂无{filter === "unread" ? "未查看" : filter === "read" ? "已查看" : ""}询盘</h3></div> : rows.map(q => <article key={q.id}>
      <div style={{ gap: 12, flexWrap: "wrap" }}><b>{q.name || "未填写姓名"} <em className={q.viewedAt ? "viewed-tag" : "unread-tag"}>{q.viewedAt ? "已查看" : "未查看"}</em></b><span>{new Date(q.createdAt).toLocaleString("zh-CN")}</span></div>
      <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{q.message}</p>
      <dl><div><dt>需求类型</dt><dd>{q.requestType || "Wholesale quote"}</dd></div><div><dt>邮箱</dt><dd><a href={`mailto:${q.email}`}>{q.email}</a></dd></div><div><dt>公司 / 国家</dt><dd>{q.company || "—"} · {q.country || "—"}</dd></div><div><dt>产品 / 数量</dt><dd>{q.product || "—"} · {q.quantity || "—"}</dd></div></dl>
      {q.attachmentUrl ? <section className="inquiry-file"><strong>客户参考附件</strong><a href={q.attachmentUrl} target="_blank" rel="noopener noreferrer">{/\.(jpe?g|png|webp)$/i.test(q.attachmentUrl) && <img src={q.attachmentUrl} alt={q.attachmentName || "客户参考图片"} loading="lazy"/>}<span>{q.attachmentName || "查看附件"} ↗</span></a></section> : <p className="no-file">附件：未上传</p>}
      <footer className="inquiry-actions"><button type="button" disabled={pending.length > 0} onClick={() => mark(q)}>{pending.includes(q.id) ? "保存中…" : q.viewedAt ? "标记为未查看" : "标记为已查看"}</button>{q.viewedAt && <small>查看于 {new Date(q.viewedAt).toLocaleString("zh-CN")}</small>}</footer>
    </article>)}</div>
    <style jsx>{`
      .inquiry-filters{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 20px}
      .inquiry-filters button,.inquiry-actions button{border:1px solid #d9d1c2;background:#fffdf8;padding:9px 15px;cursor:pointer;color:#302a23}
      .inquiry-filters button[aria-pressed="true"]{background:#8f2b23;color:#fff;border-color:#8f2b23}
      .viewed-tag,.unread-tag{display:inline-block;font-style:normal;font-size:12px;padding:3px 8px;border-radius:4px;margin-left:8px;font-weight:400}
      .viewed-tag{background:#e5eee7;color:#285d3c}.unread-tag{background:#fff0dd;color:#8c4d0f}
      .inquiry-file{border-top:1px solid #e5dfd4;padding-top:16px;margin-top:16px}
      .inquiry-file strong{display:block;font-size:13px;margin-bottom:10px}
      .inquiry-file a{display:inline-flex;flex-direction:column;gap:8px;max-width:100%;color:#8f2b23;font-size:13px;overflow-wrap:anywhere}
      .inquiry-file img{width:180px;max-width:100%;height:130px;object-fit:contain;background:#f4f0e8;border:1px solid #e5dfd4}
      .inquiries article>.no-file{font-size:12px;color:#777}
      .inquiry-actions{background:transparent;padding:16px 0 0;display:flex;gap:12px;flex-wrap:wrap;align-items:center;border-top:1px solid #e5dfd4;margin-top:16px}
      .inquiry-actions small{color:#777;font-size:12px}.inquiry-actions button:disabled{opacity:.6;cursor:wait}
    `}</style>
  </>;
}
