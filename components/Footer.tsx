import Link from "next/link";
import { getCopy, fill } from "@/lib/copy";
import type { Locale } from "@/lib/locale";

export default function Footer({ locale = "br" }: { locale?: Locale }) {
  const { FOOTER } = getCopy(locale);
  return (
    <footer className="footer">
      <img className="footer__letz" src="/brand/sticker-letz-bora-green.webp" alt={FOOTER.letz} width={720} height={336} loading="lazy" />
      <div className="footer__row">
        <img className="footer__logo" src="/brand/logo-black.png" alt="BORA" width={1200} height={307} loading="lazy" />
        <nav className="footer__links" aria-label={FOOTER.navAria}>
          {FOOTER.links.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            ) : (
              <Link key={l.label} href={l.href}>{l.label}</Link>
            ),
          )}
        </nav>
      </div>
      <div className="footer__bottom">
        <address className="footer__contact">
          <span className="footer__contact-label">{FOOTER.contactLabel}</span>
          {FOOTER.contact.map((c) => (
            <a key={c.label} href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener" : undefined}>
              {c.label}
            </a>
          ))}
        </address>
        <p className="footer__legal">{fill(FOOTER.legal, { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
