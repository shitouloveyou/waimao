import type { SiteSettings } from "@/lib/types";

export default function BrandMark({ settings }: { settings: SiteSettings }) {
  const initials = settings.companyName.split(/\s+/).map(word => word[0]).join("").slice(0, 2).toUpperCase() || "FN";
  return <span className={settings.logo ? "brand-mark has-logo" : "brand-mark"}>{settings.logo ? <img src={settings.logo} alt={`${settings.companyName} logo`} /> : initials}</span>;
}
