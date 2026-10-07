import Link from "next/link";
import { SITE } from "@/lib/copy";

export default function Header({ staticPos = false }: { staticPos?: boolean }) {
  return (
    <header className={`header${staticPos ? " header--static" : ""}`}>
      <Link href="/" className="header__logo" aria-label="BORA · início">
        <img src="/brand/logo-black.png" alt="BORA" width={1200} height={307} decoding="async" fetchPriority="high" />
      </Link>
      <a className="header__student" href={SITE.studentUrl} target="_blank" rel="noopener">
        Já sou aluno BORA
      </a>
    </header>
  );
}
