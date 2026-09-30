"use client";

import { useState } from "react";

export default function ProductGallery({ images, name, initialPosition }: { images: string[]; name: string; initialPosition?: string }) {
  const [active, setActive] = useState(images[0] || "");
  return <div className="detail-gallery"><div className="detail-image" style={active ? { backgroundImage: `url(${active})`, backgroundPosition: active === images[0] ? initialPosition || "center" : "center", backgroundSize: active === images[0] && initialPosition ? "300% 200%" : "cover" } : undefined} role="img" aria-label={name} />{images.length > 1 && <div className="detail-thumbnails">{images.map((image, index) => <button className={active === image ? "active" : ""} key={`${image}-${index}`} onClick={() => setActive(image)} aria-label={`View image ${index + 1}`}><img src={image} alt="" /></button>)}</div>}</div>;
}
