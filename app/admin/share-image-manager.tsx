"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { SiteSettings } from "@/lib/types";

export default function ShareImageManager({ settings, setSettings }: { settings: SiteSettings; setSettings: Dispatch<SetStateAction<SiteSettings>> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("请使用不超过 5MB 的 JPG、PNG 或 WebP 图片。"); return;
    }
    setBusy(true);
    try {
      const data = new FormData(); data.append("image", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      if (!response.ok) throw new Error();
      const { url } = await response.json();
      setSettings(value => ({ ...value, homeShareImage: url }));
    } catch { setError("上传失败，请检查登录状态后重试。"); }
    finally { setBusy(false); }
  }
  return <div className="settings-card">
    <h2>首页分享封面（SEO / 社交预览）</h2>
    <p>用于分享首页链接时显示的图片，独立于轮播图和产品图。留空使用 Edgevora Tools 品牌封面。</p>
    <img src={settings.homeShareImage || "/share/home"} alt="首页分享封面预览" style={{ display: "block", width: "100%", maxWidth: 600, aspectRatio: "1200 / 630", objectFit: "contain", background: "#f1ebdf", marginBottom: 16 }} />
    <label className="upload-button">{busy ? "上传中…" : "上传 / 更换分享封面"}<input disabled={busy} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
    {settings.homeShareImage && <button disabled={busy} type="button" onClick={() => setSettings(value => ({ ...value, homeShareImage: "" }))}>恢复默认品牌封面</button>}
    {error && <p role="alert">{error}</p>}
    <p>建议 1200 × 630px，最大 5MB。上传后请点击页面上方“保存设置”。分享平台可能暂时保留旧预览。</p>
  </div>;
}
