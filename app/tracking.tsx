"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
export default function Tracking() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let visitor = "";
    try {
      visitor = sessionStorage.getItem("fn_visitor") || crypto.randomUUID();
      sessionStorage.setItem("fn_visitor", visitor);
      const params = new URLSearchParams(location.search);
      if (params.get("utm_source") || !sessionStorage.getItem("fn_attribution")) sessionStorage.setItem("fn_attribution", JSON.stringify({ utmSource: params.get("utm_source") || "", utmMedium: params.get("utm_medium") || "", utmCampaign: params.get("utm_campaign") || "", source: document.referrer || "Direct", landingPage: location.href }));
    } catch { return; }
    const attribution = JSON.parse(sessionStorage.getItem("fn_attribution") || "{}");
    function send(type: string) { void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, visitor, page: pathname, source: attribution.utmSource || attribution.source || "Direct", campaign: attribution.utmCampaign || "" }), keepalive: true }).catch(() => {}); }
    send("view");
    const listener = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      if (href.includes("wa.me") || href.includes("whatsapp.com")) send("whatsapp");
      else if (href.startsWith("/products/")) send("product_click");
    };
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, [pathname]);
  return null;
}
