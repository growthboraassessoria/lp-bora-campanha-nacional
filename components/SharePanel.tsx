"use client";
// O início do growth loop: link pessoal, WhatsApp com mensagem pronta, copiar e story dinâmico.
import { useState } from "react";
import { fill } from "@/lib/copy";
import { useCopy, useLocale } from "./LocaleProvider";
import { track } from "@/lib/analytics";

type Props = { code: string; city: string; shortLink: string; fullLink: string };

export default function SharePanel({ code, city, shortLink, fullLink }: Props) {
  const { THANKS } = useCopy();
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const message = fill(THANKS.share.message, { city, link: fullLink });
  // Brasil: WhatsApp. EUA: mensagem de texto do próprio celular.
  const primaryHref = locale === "us" ? `sms:?&body=${encodeURIComponent(message)}` : `https://wa.me/?text=${encodeURIComponent(message)}`;

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
        <a className="btn btn--green" href={primaryHref} target={locale === "us" ? undefined : "_blank"} rel="noopener" onClick={() => track(locale === "us" ? "share_sms" : "share_whatsapp", { code })}>
          {THANKS.share.primary}
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
