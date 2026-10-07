import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Headline from "@/components/Headline";

export const metadata: Metadata = { title: "Aviso de privacidade" };

export default function Privacidade() {
  return (
    <>
      <Header />
      <main>
        <div className="page">
          <p className="eyebrow">BORA, Vamos em Frente</p>
          <Headline as="h1" lines={["AVISO DE", "PRIVACIDADE."]} size="m" />
          <p>Este aviso explica, em linguagem simples, o que a BORA faz com os dados que você informa na campanha "BORA, Vamos em Frente".</p>

          <h2>O que coletamos</h2>
          <ul>
            <li><strong>Cadastro:</strong> nome, sobrenome, WhatsApp, e-mail e CEP.</li>
            <li><strong>Do CEP:</strong> cidade e estado, para contar sua cidade no ranking. Não guardamos seu endereço completo.</li>
            <li><strong>Opcional:</strong> respostas sobre como você corre, seu objetivo, seu clube e onde trabalha, se você quiser responder.</li>
            <li><strong>Uso da página:</strong> eventos como cadastro iniciado, link compartilhado e cliques, de forma agregada, para melhorar a campanha.</li>
          </ul>

          <h2>Para que usamos</h2>
          <ul>
            <li>Contar quantas pessoas querem a BORA em cada cidade e estado.</li>
            <li>Colocar você no grupo da BORA do seu estado e falar com você sobre a chegada da BORA, por WhatsApp e e-mail.</li>
            <li>Atribuir indicações ao seu link pessoal.</li>
            <li>Oferecer o programa Aluno Fundador na sua cidade.</li>
          </ul>

          <h2>Com quem compartilhamos</h2>
          <p>Com as ferramentas que usamos para guardar os dados, enviar mensagens e medir a campanha. Não vendemos seus dados.</p>

          <h2>Por quanto tempo</h2>
          <p>Enquanto a campanha durar e pelo tempo necessário para a BORA chegar à sua cidade. Você pode pedir a exclusão a qualquer momento.</p>

          <h2>Seus direitos</h2>
          <p>Você pode pedir acesso, correção ou exclusão dos seus dados, e sair das comunicações, falando com a BORA pelos canais oficiais indicados no site.</p>

          <h2>Base legal</h2>
          <p>Tratamos seus dados com base no seu consentimento, dado no cadastro, e no legítimo interesse da BORA em organizar a chegada a novas cidades, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
        </div>
      </main>
      <Footer />
    </>
  );
}
