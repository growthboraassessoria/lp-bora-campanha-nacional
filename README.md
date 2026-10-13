# LP · BORA, Vamos em Frente

Landing page da campanha nacional da BORA: a pessoa digita o CEP, coloca a cidade no mapa, chama amigos pelo link pessoal e acompanha o ranking de cidades. Quando a cidade ganha força, abrem as vagas de Aluno Fundador (Founding 50).

## Stack

- Next.js 16 (App Router, TypeScript), React 19
- GSAP 3.15 (ScrollTrigger, DrawSVG, SplitText)
- Supabase (Postgres com RLS; chave de serviço só no servidor)
- Fonte Altone local (`app/fonts`), identidade visual 2026 da BORA (`public/brand`)

## Rodar

```bash
npm install
cp .env.example .env.local   # preencha o que tiver
npm run dev                  # http://localhost:3000
```

Sem `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`, em desenvolvimento os dados vão para `.data/db.json` (apague o arquivo para zerar). Em produção, sem essas variáveis, nada é gravado.

## Variáveis de ambiente

Veja `.env.example`. As obrigatórias em produção: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LEAD_COOKIE_SECRET`, `NEXT_PUBLIC_SITE_URL`. Opcionais: `NEXT_PUBLIC_SHORT_DOMAIN` (só quando o domínio curto estiver apontando para a LP), `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, Turnstile e `NEXT_PUBLIC_CHECKOUT_URL`.

## Banco

Migrations em `supabase/migrations`. Com o CLI do Supabase vinculado ao projeto: `supabase db push`.

## BORA ID e carteirinha

Cada cadastro recebe um número nacional sequencial (`leads.bora_number`, exibido como `#0001`). A página de obrigado mostra a carteirinha digital com o número, nome, cidade e o QR code do link pessoal; `/api/carteirinha` gera a imagem para salvar (só para quem tem o cookie do cadastro) e a story inclui o número e o QR. O CPF é único por pessoa e também evita cadastro duplicado. Para recomeçar a numeração em #0001 depois de apagar cadastros de teste: `select setval('bora_number_seq', 1, false);`.

As respostas opcionais da página de obrigado ficam em `qualification_answers` (uma por pessoa e pergunta). Para ler o resumo: `node scripts/respostas.mjs [UF]`.

## Área do membro

Quem se cadastrou entra em `/entrar` com CPF e data de nascimento (cookie assinado, o mesmo do pós-cadastro) e cai em `/eu`: carteirinha, desempenho das indicações (cliques, cadastros, rede, posição da cidade), link pessoal e perfil. No perfil dá para trocar foto (recortada em quadrado no navegador e guardada no bucket `avatars` do Supabase), nome, telefones, e-mail, Instagram, uma linha sobre você e o CEP (muda a cidade). Com o perfil público ligado, a pessoa aparece na página da cidade (`/cidade/[slug]`) com nome, inicial do sobrenome, foto, Instagram e, se permitir, um botão de WhatsApp. A entrada por CPF e data tem limite de tentativas por IP e por CPF; é uma proteção simples, pensada para dados de contato, não para dados sensíveis.

## Versão dos EUA (`/us`)

A mesma campanha em inglês, com mapa dos EUA e busca por ZIP code. Tudo o que muda entre os países está em `lib/locale.ts` (rotas, formatos, recursos ligados) e os textos em `lib/copy/br.ts` e `lib/copy/us.ts`, com as mesmas chaves. As páginas dos dois países usam as mesmas telas (`screens/`).

- **Cadastro:** ZIP code, nome, celular, e-mail, data de nascimento (MM/DD/AAAA, mínimo de 13 anos) e sexo. Sem CPF. O aceite de mensagens de texto é uma caixa separada e opcional (`marketing_consent`).
- **Entrada na área do membro:** celular e data de nascimento.
- **Oferta oculta:** sem Founding 50, sem preço, sem grupo de WhatsApp e sem as praças da BORA. Para ligar, mudar `features` em `lib/locale.ts`.
- **No banco não há coluna de país.** Cidade dos EUA tem slug `us-<uf>-<cidade>` (ex.: `us-tx-austin`) e estado no padrão ISO (`US-TX`), porque seis siglas existem nos dois países. O telefone vai em E.164 (`+1XXXXXXXXXX`). Cadastros, eventos e cliques dos EUA gravam `site_id = 'vamos-em-frente-us'`. O ranking e os totais de cada país filtram pelo slug.
- **E-mail e telefone são únicos na tabela inteira:** uma pessoa tem um BORA ID só, em qualquer país. A numeração é uma só.
- **Dados:** `data/us-zips.tsv` (ZIP → cidade, estado, posição; GeoNames, CC BY 4.0, crédito na página de termos) e `lib/geo/us-states.ts` (contornos do us-atlas, U.S. Census). Para regerar: `node scripts/build-us-zips.mjs /caminho/US.txt` e `node scripts/build-us-geo.mjs`.
- **Teste:** `node scripts/qa-us.mjs [pasta] [base]`.

## Rotas

`/` (campanha), `/obrigado` (pós-cadastro, com link de indicação), `/cidade/[uf-slug]`, `/ranking`, `/fundador`, `/entrar`, `/eu` (área do membro), `/r/[codigo]` (link de indicação), `/api/story` (story 1080×1920 da cidade), `/privacidade`, `/termos`. Nos EUA: `/us`, `/us/thanks`, `/us/me`, `/us/login`, `/us/ranking`, `/us/city/[uf-cidade]`, `/us/privacy`, `/us/terms` e `/api/zip`.

## QA

- `node scripts/qa-shots.mjs [pasta] [base]` captura páginas em desktop e celular e aponta estouro horizontal.
- `node scripts/qa-flow.mjs` percorre cadastro → obrigado → link → cidade → ranking → story → fundador.
- `node scripts/qa-overflow.mjs [url] [largura]` lista o que passa da borda da tela.
- `node scripts/qa-404.mjs` lista respostas com erro e erros de console nas rotas.

Os scripts usam o Google Chrome instalado na máquina (`puppeteer-core`).
