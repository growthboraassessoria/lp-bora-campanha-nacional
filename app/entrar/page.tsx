import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";
import LoginForm from "@/components/LoginForm";
import { getCurrentLead } from "@/lib/server/session";
import { LOGIN } from "@/lib/copy";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar na minha área", robots: { index: false } };

export default async function Entrar() {
  const lead = await getCurrentLead();
  if (lead) redirect("/eu");
  return (
    <>
      <Header />
      <main>
        <div className="page login">
          <p className="eyebrow">{LOGIN.eyebrow}</p>
          <Headline as="h1" lines={LOGIN.title} size="l" green={[1]} />
          <p className="lede">{LOGIN.text}</p>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
