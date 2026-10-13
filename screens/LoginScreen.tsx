// Entrada na área do membro. Quem já está com a sessão aberta vai direto para a área do seu país.
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";
import LoginForm from "@/components/LoginForm";
import { getCurrentLead } from "@/lib/server/session";
import { getCopy } from "@/lib/copy";
import { LOCALES, localeOfLead, type Locale } from "@/lib/locale";

export default async function LoginScreen({ locale }: { locale: Locale }) {
  const lead = await getCurrentLead();
  if (lead) redirect(LOCALES[localeOfLead(lead)].routes.me);
  const { LOGIN } = getCopy(locale);
  return (
    <>
      <Header locale={locale} />
      <main>
        <div className="page login">
          <p className="eyebrow">{LOGIN.eyebrow}</p>
          <Headline as="h1" lines={LOGIN.title} size="l" green={[1]} />
          <p className="lede">{LOGIN.text}</p>
          <LoginForm />
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
