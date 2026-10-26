"use client";

export default function HeroMedia({ image }: { image?: string }) {
  if (!image) return <div className="hero-bg" />;
  return <div className="hero-media hero-static" aria-hidden="true">
    <img className="hero-static-product" src={image} alt="" fetchPriority="high" />
    <div className="hero-video-shade" />
  </div>;
}
