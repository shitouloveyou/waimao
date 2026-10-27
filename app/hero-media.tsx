"use client";
import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";

import { useEffect, useMemo, useState } from "react";
export default function HeroMedia({ images, image }: {
    images?: string[];
    image?: string;
}) {
    const slides = useMemo(() => Array.from(new Set(images?.filter(Boolean).length ? images.filter(Boolean) : image ? [image] : [])), [images, image]);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const signature = slides.join("|");
    useEffect(() => { setIndex(0); }, [signature]);
    useEffect(() => {
        if (paused || slides.length < 2)
            return;
        const timer = window.setInterval(() => setIndex(value => (value + 1) % slides.length), 5000);
        return () => window.clearInterval(timer);
    }, [paused, signature, slides.length]);
    if (!slides.length)
        return <div className="hero-bg"/>;
    const active = index % slides.length;
    return <div className="hero-media hero-static">
    <img key={slides[active]} className="hero-static-product" src={slides[active]} alt="" fetchPriority="high"/>
    <div className="hero-video-shade" aria-hidden="true"/>
    {slides.length > 1 && <div className="hero-slide-controls">
      {slides.map((src, i) => <TranslatedButton key={src} type="button" aria-label={`Show product image ${i + 1}`} aria-pressed={active === i} onClick={() => setIndex(i)}><TranslatedText>{i + 1}</TranslatedText></TranslatedButton>)}
      <TranslatedButton type="button" aria-label={paused ? "Resume image slideshow" : "Pause image slideshow"} onClick={() => setPaused(value => !value)}><TranslatedText>{paused ? "▶" : "Ⅱ"}</TranslatedText></TranslatedButton>
    </div>}
  </div>;
}
