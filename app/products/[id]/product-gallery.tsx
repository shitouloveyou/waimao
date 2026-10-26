"use client";

import { useState } from "react";

export default function ProductGallery({ images, name, initialPosition, imageAlt }: { images: string[]; name: string; initialPosition?: string; imageAlt?: string }) {
  const [active, setActive] = useState(images[0] || "");
  const useCatalogCrop = active === images[0] && active === "/scissors-catalog.png" && Boolean(initialPosition);
  return <div className="detail-gallery"><div className="detail-image" style={active ? { backgroundImage: `url(${active})`, backgroundPosition: useCatalogCrop ? initialPosition : "center", backgroundSize: useCatalogCrop ? "300% 200%" : "contain" } : undefined} role="img" aria-label={imageAlt || name} />{images.length > 1 && <div className="detail-thumbnails">{images.map((image, index) => <button className={active === image ? "active" : ""} key={`${image}-${index}`} onClick={() => setActive(image)} aria-label={`View image ${index + 1}`}><img src={image} alt={`${imageAlt || name} - view ${index + 1}`} /></button>)}</div>}</div>;
}
