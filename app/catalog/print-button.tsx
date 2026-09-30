"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return <button className="catalog-print" onClick={() => window.print()}><Download /> Print / Save PDF</button>;
}
