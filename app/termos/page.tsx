import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";

export const metadata: Metadata = { title: "Termos" };

export default function Termos() {
  return (
    <>
      <Header />
      <main>
        <div className="page">
          <p className="eyebrow">BORA, Vamos em Frente</p>
          <Headline as="h1" lines={["TERMOS DA", "CAMPANHA."]} size="m" />

          <h2>O cadastro</h2>
          <p>O cadastro na campanha é gratuito e não gera cobrança. Ele registra o seu interesse em ter a BORA na sua cidade e conta para o ranking da sua cidade e do seu estado.</p>

          <h2>O ranking</h2>
          <p>O ranking mostra quantas pessoas se cadastraram por cidade. A meta inicial de 500 pessoas por cidade é um marco de referência: a decisão de realizar um treino aberto ou abrir operação em uma cidade é da BORA e considera outros fatores.</p>

          <h2>O link de indicação</h2>
          <p>Cada pessoa recebe um link pessoal. Cadastros feitos por esse link contam para a cidade e para o nível de embaixador de quem indicou. Cadastros duplicados, feitos em nome de terceiros ou de forma automatizada não contam e podem ser removidos.</p>

          <h2>Aluno Fundador</h2>
          <p>O programa Aluno Fundador é limitado aos 50 primeiros atletas de cada cidade que contratarem a BORA Online. As condições comerciais, o número de Fundador e os benefícios são informados na página do programa no momento da contratação. Regras de cancelamento e renovação seguem o contrato da BORA Online.</p>

          <h2>Comunicação</h2>
          <p>Ao se cadastrar, você aceita receber comunicação da BORA por WhatsApp e e-mail sobre a campanha e sobre a chegada da BORA à sua cidade. Você pode sair quando quiser.</p>

          <h2>Alterações</h2>
          <p>A BORA pode ajustar as regras da campanha. Mudanças relevantes são comunicadas nos grupos e por e-mail.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
