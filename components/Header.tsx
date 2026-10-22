import Link from "next/link";
import { getCopy } from "@/lib/copy";
import { LOCALES, type Locale } from "@/lib/locale";
import StudentInvite from "./StudentInvite";

export default function Header({ staticPos = false, locale = "br" }: { staticPos?: boolean; locale?: Locale }) {
  const { SITE } = getCopy(locale);
  const cfg = LOCALES[locale];
  return (
    <header className={`header${staticPos ? " header--static" : ""}`}>
      <Link href={cfg.routes.home} className="header__logo" aria-label={SITE.homeAria}>
        <img src="/brand/logo-black.png" alt="BORA" width={1200} height={307} decoding="async" fetchPriority="high" />
      </Link>
      <nav className="header__nav" aria-label={SITE.navAria}>
        <Link className="header__student header__student--area" href={cfg.routes.me}>{SITE.areaLabel}</Link>
        {cfg.features.studentLink ? <StudentInvite variant="header" /> : null}
      </nav>
    </header>
  );
}
