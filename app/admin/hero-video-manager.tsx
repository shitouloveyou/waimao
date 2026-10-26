"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function HeroVideoManager({ settings, setSettings }: { settings: SiteSettings; setSettings: Dispatch<SetStateAction<SiteSettings>> }) {
  const [uploading, setUploading] = useState(false);
  const images = settings.heroImages ?? (settings.heroImage ? [settings.heroImage] : []);
  const update = (next: string[]) => setSettings(value => ({ ...value, heroImages: next, heroImage: "" }));
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images]; [next[index], next[target]] = [next[target], next[index]]; update(next);
  };
  async function upload(files: File[]) {
    const available = 6 - images.length;
    if (!files.length || available <= 0) return;
    if (files.length > available) alert(`最多6张，本次只上传前${available}张。`);
    setUploading(true);
    const added: string[] = [];
    const failures: string[] = [];
    for (const file of files.slice(0, available)) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
        failures.push(file.name + "：格式不支持或超过5MB"); continue;
      }
      try {
        const data = new FormData(); data.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: data });
        if (!response.ok) throw new Error();
        const { url } = await response.json(); added.push(url);
      } catch { failures.push(file.name + "：上传失败"); }
    }
    if (added.length) update([...images, ...added]);
    setUploading(false);
    if (failures.length) alert(failures.join("\n"));
  }
  return <div className="settings-card hero-video-manager">
    <div className="video-manager-head"><div><h2>首页图片轮播</h2><p>图片按下面的顺序每5秒自动切换，左侧文字保持不变。</p></div><label className="upload-button"><ImagePlus/> {uploading ? "上传中..." : "添加轮播图片"}<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploading || images.length >= 6} onChange={event => { const files = Array.from(event.target.files || []); event.currentTarget.value = ""; void upload(files); }}/></label></div>
    <p className="settings-reminder">最多6张，可一次选择多张。支持 JPG、PNG、WebP，单张不超过5MB；建议使用白底产品图。</p>
    {images.length ? <div className="video-list">{images.map((src, index) => <article key={src}>
      <img src={src} alt={`轮播图片 ${index + 1}`} style={{width:150,height:100,objectFit:"contain",background:"#fff"}}/>
      <div><b>首页图片 {index + 1}</b><span>播放顺序 {index + 1}</span></div>
      <div className="video-actions">
        <button type="button" title="上移" disabled={uploading || index === 0} onClick={() => move(index, -1)}><ArrowUp/></button>
        <button type="button" title="下移" disabled={uploading || index === images.length - 1} onClick={() => move(index, 1)}><ArrowDown/></button>
        <button type="button" title="移除" disabled={uploading} onClick={() => update(images.filter((_, i) => i !== index))}><Trash2/></button>
      </div>
    </article>)}</div> : <div className="video-empty"><ImagePlus/><span>未上传时，首页默认展示第一张产品图。</span></div>}
    <p className="settings-reminder">上传、排序或移除后，请点击页面上方“保存设置”才会在首页生效。</p>
  </div>;
}
