import Link from "next/link";
import { headers } from "next/headers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";
import { getCopy } from "@/lib/copy";
import { LOCALES } from "@/lib/locale";

export default async function NotFound() {
  const locale = (await headers()).get("x-bora-locale") === "us" ? "us" : "br";
  const { CITY_PAGE, FORM } = getCopy(locale);
  const cfg = LOCALES[locale];
  return (
    <>
      <Header locale={locale} />
      <main>
        <div className="page">
          <p className="eyebrow">{CITY_PAGE.eyebrow}</p>
          <Headline as="h1" lines={CITY_PAGE.unknownTitle} size="m" />
          <p className="lede">{CITY_PAGE.unknownText}</p>
          <div>
            <Link className="btn btn--green btn--lg btn-arrow" href={cfg.routes.signup}>{FORM.cta}</Link>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
