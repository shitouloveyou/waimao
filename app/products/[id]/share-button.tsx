"use client";
import { TranslatedText, TranslatedInput, TranslatedTextarea, TranslatedButton, TranslatedSelect } from "@/app/translation-context";

import { Share2 } from "lucide-react";
import { useState } from "react";
export default function ShareButton({ title }: {
    title: string;
}) {
    const [copied, setCopied] = useState(false);
    async function share() { try {
        if (navigator.share)
            await navigator.share({ title, url: location.href });
        else {
            await navigator.clipboard.writeText(location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }
    catch { /* Visitor cancelled the native share dialog. */ } }
    return <TranslatedButton className="share-button" onClick={share}><Share2 /> <TranslatedText>{copied ? "Link copied" : "Share product"}</TranslatedText></TranslatedButton>;
}
