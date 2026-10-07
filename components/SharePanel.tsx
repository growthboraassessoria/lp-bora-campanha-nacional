"use client";
// O início do growth loop: link pessoal, WhatsApp com mensagem pronta, copiar e story dinâmico.
import { useState } from "react";
import { THANKS, fill } from "@/lib/copy";
import { track } from "@/lib/analytics";

type Props = { code: string; city: string; shortLink: string; fullLink: string };

export default function SharePanel({ code, city, shortLink, fullLink }: Props) {
  const [copied, setCopied] = useState(false);
  const message = fill(THANKS.share.message, { city, link: fullLink });
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const el = document.getElementById("share-link-text");
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        getSelection()?.removeAllRanges();
        getSelection()?.addRange(range);
      }
    }
    track("share_copy", { code });
  }

  return (
    <div className="share">
      <p className="thanks__label" style={{ marginBottom: 10 }}>{THANKS.share.label}</p>
      <div className="share__link">
        <span id="share-link-text">{shortLink}</span>
      </div>
      <div className="share__btns" style={{ marginTop: 16 }}>
        <a className="btn btn--green" href={wa} target="_blank" rel="noopener" onClick={() => track("share_whatsapp", { code })}>
          {THANKS.share.whatsapp}
        </a>
        <button type="button" className="btn btn--outline" onClick={copy} aria-live="polite">
          {copied ? THANKS.share.copied : THANKS.share.copy}
        </button>
        <a className="btn btn--outline" href={`/api/story?c=${code}`} target="_blank" rel="noopener" onClick={() => track("share_instagram", { code })}>
          {THANKS.share.story}
        </a>
      </div>
    </div>
  );
}
