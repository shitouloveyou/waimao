"use client";

import { useEffect, useMemo, useState } from "react";
import type { HeroVideo } from "@/lib/types";

export default function HeroMedia({ videos }: { videos?: HeroVideo[] }) {
  const playlist = useMemo(() => (videos || []).filter(video => video.enabled && video.url), [videos]);
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => { setIndex(0); setReady(false); }, [playlist.length]);
  if (!playlist.length) return <div className="hero-bg" />;
  const current = playlist[index % playlist.length];
  const next = () => { setReady(false); setIndex(value => (value + 1) % playlist.length); };

  return <div className="hero-media" aria-hidden="true">
    <div className="hero-bg" />
    <video
      key={current.url}
      className={ready ? "ready" : ""}
      src={current.url}
      autoPlay
      muted
      playsInline
      preload="metadata"
      loop={playlist.length === 1}
      onCanPlay={() => setReady(true)}
      onEnded={next}
      onError={next}
    />
    <div className="hero-video-shade" />
  </div>;
}
