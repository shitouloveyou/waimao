import { ImageResponse } from "next/og";

// A product-independent default for the homepage. No remote fonts or images.
export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#f1ebdf", color: "#172a24", padding: "64px 76px", borderTop: "14px solid #a53127" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 84, height: 84, border: "2px solid #b7a485", fontSize: 35, fontWeight: 700 }}>EV</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2 }}>EDGEVORA TOOLS</div>
          <div style={{ marginTop: 9, fontSize: 18, letterSpacing: 4, color: "#716859" }}>TOOLS & HARDWARE</div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 62, fontSize: 66, fontWeight: 700, lineHeight: 1.1 }}>Tools for your next order.</div>
      <div style={{ display: "flex", marginTop: 24, fontSize: 27, color: "#5c665e" }}>Explore our products. Talk to us about your requirements.</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 24, borderTop: "1px solid #c6beae" }}>
        <div style={{ fontSize: 24 }}>edgevoratools.com</div>
        <div style={{ fontSize: 18, letterSpacing: 2, color: "#a53127" }}>PRODUCTS · SAMPLES · QUOTES</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
