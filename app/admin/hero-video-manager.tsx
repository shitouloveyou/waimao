"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function HeroVideoManager({ settings, setSettings }: { settings: SiteSettings; setSettings: Dispatch<SetStateAction<SiteSettings>> }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert("请使用 JPG、PNG 或 WebP 图片，单张不超过 5MB。"); return;
    }
    setUploading(true);
    try {
      const data = new FormData(); data.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      if (!response.ok) throw new Error("图片上传失败，请稍后重试。");
      const { url } = await response.json();
      setSettings(value => ({ ...value, heroImage: url }));
    } catch (error) { alert(error instanceof Error ? error.message : "图片上传失败。"); }
    finally { setUploading(false); }
  }
  return <div className="settings-card hero-video-manager">
    <div className="video-manager-head"><div><h2>首页展示图片</h2><p>首页使用静态产品图片，左侧展示文字，右侧完整展示产品。</p></div><label className="upload-button"><ImagePlus/> {uploading ? "上传中..." : "上传 / 更换首图"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={event => { upload(event.target.files?.[0]); event.currentTarget.value = ""; }}/></label></div>
    <p className="settings-reminder">支持 JPG、PNG、WebP，单张不超过 5MB。建议使用白底产品图，图片本身不用预留大块空白。</p>
    {settings.heroImage ? <div><img src={settings.heroImage} alt="首页产品图片预览" style={{width:"100%",maxWidth:420,height:260,objectFit:"contain",background:"#fff"}}/><button type="button" disabled={uploading} onClick={() => setSettings(value => ({...value,heroImage:""}))}>恢复默认产品图</button></div> : <div className="video-empty"><ImagePlus/><span>未单独设置时，自动使用第一张已上传的产品图。</span></div>}
    <p className="settings-reminder">上传或调整后，请点击页面上方“保存设置”才会在首页生效。</p>
  </div>;
}
