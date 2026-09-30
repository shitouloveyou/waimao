"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() { try { if (navigator.share) await navigator.share({ title, url: location.href }); else { await navigator.clipboard.writeText(location.href); setCopied(true); setTimeout(()=>setCopied(false),2000); } } catch { /* Visitor cancelled the native share dialog. */ } }
  return <button className="share-button" onClick={share}><Share2 /> {copied ? "Link copied" : "Share product"}</button>;
}
