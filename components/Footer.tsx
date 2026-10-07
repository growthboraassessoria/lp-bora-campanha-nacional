import Link from "next/link";
import { FOOTER } from "@/lib/copy";

export default function Footer() {
  return (
    <footer className="footer">
      <img className="footer__letz" src="/brand/sticker-letz-bora-green.webp" alt={FOOTER.letz} width={720} height={336} loading="lazy" />
      <div className="footer__row">
        <img className="footer__logo" src="/brand/logo-black.png" alt="BORA" width={1200} height={307} loading="lazy" />
        <nav className="footer__links" aria-label="Rodapé">
          {FOOTER.links.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} target="_blank" rel="noopener">{l.label}</a>
            ) : (
              <Link key={l.label} href={l.href}>{l.label}</Link>
            ),
          )}
        </nav>
      </div>
      <p className="footer__legal">BORA · {new Date().getFullYear()} · Uma assessoria para todos.</p>
    </footer>
  );
}
