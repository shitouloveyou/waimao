"use client";

import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { ArrowDown, ArrowUp, Film, Trash2 } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function HeroVideoManager({ settings, setSettings }: { settings: SiteSettings; setSettings: Dispatch<SetStateAction<SiteSettings>> }) {
  const [uploading, setUploading] = useState(false);
  const videos = settings.heroVideos || [];
  const update = (next: SiteSettings["heroVideos"]) => setSettings(value => ({ ...value, heroVideos: next }));
  const move = (index: number, direction: -1 | 1) => { const target=index+direction;if(target<0||target>=videos.length)return;const next=[...videos];[next[index],next[target]]=[next[target],next[index]];update(next); };
  async function upload(file?: File) {
    if (!file || videos.length >= 5) return;
    setUploading(true);
    const data = new FormData(); data.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: data });
    if (response.ok) { const { url } = await response.json(); update([...videos, { id: crypto.randomUUID(), url, name: file.name, enabled: true }]); }
    else alert("视频上传失败：请使用 MP4 或 WebM，单段不超过 8MB。");
    setUploading(false);
  }
  return <div className="settings-card hero-video-manager">
    <div className="video-manager-head"><div><h2>首页动态视频</h2><p>视频会按照下面的顺序自动静音播放；全部关闭或没有视频时，首页继续显示原来的首图。</p></div><label className={`upload-button ${videos.length>=5?"disabled":""}`}><Film/> {uploading?"上传中...":"上传短视频"}<input type="file" accept="video/mp4,video/webm" disabled={uploading||videos.length>=5} onChange={event=>{upload(event.target.files?.[0]);event.currentTarget.value="";}}/></label></div>
    <p className="settings-reminder">最多 5 段；MP4/WebM；每段不超过 8MB。建议横屏 1920×1080、6–12 秒、无声画面。</p>
    {videos.length===0?<div className="video-empty"><Film/><span>暂未上传视频，首页当前使用静态首图。</span></div>:<div className="video-list">{videos.map((video,index)=><article key={video.id}><video src={video.url} muted playsInline preload="metadata"/><div><b>{video.name||`首页视频 ${index+1}`}</b><span>播放顺序 {index+1}</span></div><label className="video-toggle"><input type="checkbox" checked={video.enabled} onChange={event=>update(videos.map((item,i)=>i===index?{...item,enabled:event.target.checked}:item))}/><span>{video.enabled?"启用":"停用"}</span></label><div className="video-actions"><button title="上移" disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp/></button><button title="下移" disabled={index===videos.length-1} onClick={()=>move(index,1)}><ArrowDown/></button><button title="移除" onClick={()=>update(videos.filter((_,i)=>i!==index))}><Trash2/></button></div></article>)}</div>}
    <p className="settings-reminder">上传或调整后，请点击页面上方“保存设置”才会在首页生效。</p>
  </div>;
}
