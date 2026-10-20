"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export const consentEvent = "edgevora-consent-change";

export default function CookieConsent({ enabled }: { enabled: boolean }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(enabled && !localStorage.getItem("edgevora_analytics_consent")); }, [enabled]);
  function choose(value: "accepted" | "declined") { localStorage.setItem("edgevora_analytics_consent", value); window.dispatchEvent(new CustomEvent(consentEvent, { detail: value })); if (value === "accepted") location.reload(); else setVisible(false); }
  if (!visible) return null;
  return <aside className="cookie-consent" aria-label="Analytics preferences"><div><b>Privacy choices</b><p>We use optional analytics to understand website visits and inquiry conversions. You can decline without affecting the website or inquiry form. <Link href="/privacy">Privacy notice</Link></p></div><div><button onClick={() => choose("declined")}>Decline</button><button className="accept" onClick={() => choose("accepted")}>Accept analytics</button></div></aside>;
}
