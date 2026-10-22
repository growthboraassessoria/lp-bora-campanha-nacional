"use client";
// Quem já é aluno BORA: a gente comemora e pede para postar a página para quem ainda não tem BORA na cidade.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { fill } from "@/lib/copy";
import { track } from "@/lib/analytics";
import Headline from "./Headline";
import { useCopy } from "./LocaleProvider";

type Props = { variant: "header" | "footer"; label?: string };

export default function StudentInvite({ variant, label }: Props) {
  const { SITE, STUDENT } = useCopy();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const titleId = useId();
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  function openInvite() {
    setOpen(true);
    track("student_invite_view", { from: variant });
  }

  function pageLink() {
    return `${window.location.origin}/`;
  }

  function shareHref() {
    return `https://wa.me/?text=${encodeURIComponent(fill(STUDENT.message, { link: pageLink() }))}`;
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* segue */
    }
    track("student_share_copy", { from: variant });
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => ctaRef.current?.focus(), 20);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        track("student_invite_dismiss", { from: variant });
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [ctaRef.current, skipRef.current, closeRef.current].filter(
        (el): el is HTMLAnchorElement | HTMLButtonElement => el != null,
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [close, open, variant]);

  const triggerCls = variant === "header" ? "header__student" : "footer__invite";
  const dialog = open ? (
    <div className="invite" role="presentation">
      <button type="button" className="invite__backdrop" tabIndex={-1} aria-hidden="true" onClick={() => { track("student_invite_dismiss", { from: variant }); close(); }} />
      <div className="invite__card" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button ref={closeRef} type="button" className="welcome__x" aria-label={STUDENT.close} onClick={() => { track("student_invite_dismiss", { from: variant }); close(); }} />
        <img className="welcome__sticker" src="/brand/sticker-fist-bump-green.webp" alt={STUDENT.sticker} width={220} height={220} />
        <p className="eyebrow eyebrow--dot">{STUDENT.eyebrow}</p>
        <Headline id={titleId} lines={STUDENT.title} size="s" green={[1]} />
        <p className="welcome__text">{STUDENT.text}</p>
        <a
          ref={ctaRef}
          className="btn btn--green btn--block btn-arrow"
          href={shareHref()}
          target="_blank"
          rel="noopener"
          onClick={() => track("student_share_whatsapp", { from: variant })}
        >
          {STUDENT.share}
        </a>
        <button type="button" className="btn btn--outline btn--block" onClick={copy} aria-live="polite">
          {copied ? STUDENT.copied : STUDENT.copy}
        </button>
        <a
          className="btn btn--outline btn--block"
          href={SITE.studentUrl}
          target="_blank"
          rel="noopener"
          onClick={() => track("student_site_click", { from: variant })}
        >
          {STUDENT.site}
        </a>
        <button ref={skipRef} type="button" className="welcome__skip" onClick={() => { track("student_invite_dismiss", { from: variant }); close(); }}>
          {STUDENT.skip}
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button type="button" className={triggerCls} onClick={openInvite}>
        {label ?? SITE.studentLabel}
      </button>
      {dialog ? createPortal(dialog, document.body) : null}
    </>
  );
}
