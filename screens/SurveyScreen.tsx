// Formulário separado das perguntas da campanha. Só Brasil: a pessoa entra com o CPF do cadastro.
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SurveyForm from "@/components/SurveyForm";

export default function SurveyScreen() {
  return (
    <>
      <Header locale="br" />
      <main>
        <div className="page login survey">
          <SurveyForm />
        </div>
      </main>
      <Footer locale="br" />
    </>
  );
}
