import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";
import { CITY_PAGE } from "@/lib/copy";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <div className="page">
          <p className="eyebrow">BORA, Vamos em Frente</p>
          <Headline as="h1" lines={CITY_PAGE.unknownTitle} size="m" />
          <p className="lede">{CITY_PAGE.unknownText}</p>
          <div>
            <Link className="btn btn--green btn--lg btn-arrow" href="/#cadastro">Quero a BORA na minha cidade</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
