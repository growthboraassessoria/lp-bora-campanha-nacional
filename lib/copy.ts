// Todo o texto público da campanha. Nenhum texto visível fica dentro de componente.
// Tom: direto, positivo, brasileiro, jovem. Sempre "BORA", nunca "BORA Assessoria" no corpo.

export const SITE = {
  name: "BORA, Vamos em Frente",
  description: "Quer treinar com a BORA, mas ainda não temos uma operação perto de você? Cadastre-se e coloque sua cidade no mapa.",
  studentUrl: "https://boraassessoria.com/",
  instagram: "https://www.instagram.com/bora.assessoria/",
  areaLabel: "Minha área",
};

export const HERO = {
  eyebrow: "BORA, VAMOS EM FRENTE",
  headline: {
    A: ["BORA", "NA SUA", "CIDADE."],
    B: ["SUA CIDADE", "ESTÁ PRONTA", "PARA A BORA?"],
  },
  sub: "Quer treinar com a BORA, mas ainda não temos uma operação perto de você?",
  text: "Estamos mapeando as próximas cidades da BORA no Brasil. Cadastre-se, chame seus amigos e ajude sua cidade a entrar no mapa.",
  geo: {
    idle: "ME MOSTRAR NO MAPA",
    asking: "LOCALIZANDO…",
    found: "VOCÊ ESTÁ EM {uf}",
    foundNear: "VOCÊ ESTÁ PERTO DE {city}",
    outside: "NÃO ACHAMOS VOCÊ NO MAPA",
    denied: "LOCALIZAÇÃO BLOQUEADA NO NAVEGADOR",
    unsupported: "SEU NAVEGADOR NÃO INFORMA LOCALIZAÇÃO",
    you: "VOCÊ",
    hint: "Só com a sua permissão. A posição não sai do seu aparelho.",
  },
  legend: { units: "A BORA já está aqui", asking: "Pedindo a BORA", hot: "Mais pedidos", signal: "Mais citadas nas redes" },
};

export const FORM = {
  cepTitle: "DIGITE SEU CEP E COLOQUE SUA CIDADE NO MAPA.",
  cepLabel: "CEP",
  cepPlaceholder: "00000-000",
  cepHelp: "Seu CEP diz em qual cidade você conta. Não guardamos seu endereço.",
  resolving: "Procurando sua cidade…",
  confirmQuestion: "É aqui?",
  confirmYes: "SIM, É AQUI",
  confirmFix: "Corrigir cidade",
  yourCity: "Sua cidade:",
  approxNote: "Localização aproximada no mapa.",
  fields: { first_name: "Nome", last_name: "Sobrenome", phone: "WhatsApp", email: "E-mail", cpf: "CPF", birth_date: "Data de nascimento", sex: "Sexo" },
  placeholders: { cpf: "000.000.000-00", birth_date: "DD/MM/AAAA" },
  cpfHelp: "Garante um cadastro único por pessoa. É ele que gera o seu BORA ID.",
  sexOptions: [
    { value: "F", label: "Feminino" },
    { value: "M", label: "Masculino" },
    { value: "N", label: "Prefiro não dizer" },
  ],
  consent: "Aceito o aviso de privacidade e quero receber contato da BORA por WhatsApp e e-mail.",
  cta: "QUERO A BORA NA MINHA CIDADE",
  sending: "COLOCANDO NO MAPA…",
  micro: "Leva 30 segundos. Sem cobrança.",
  existing: "Você já está no movimento. Vamos te levar para o seu link.",
  placedLine: "Você acabou de colocar {city} no mapa.",
  unit: {
    eyebrow: "BOA NOTÍCIA",
    title: "A BORA JÁ ESTÁ EM {city}.",
    text: "Você não precisa esperar a campanha: já dá para treinar com a gente aí.",
    cta: "CONHECER A BORA {city}",
    fix: "Corrigir CEP",
  },
};

export const PROOF = {
  people: "PESSOAS",
  cities: "CIDADES",
  states: "ESTADOS",
  line: ["AGORA MESMO,", "O BRASIL ESTÁ PEDINDO BORA."],
  empty: ["O MAPA", "COMEÇA COM VOCÊ."],
};

export const HOW = {
  title: ["COMO A BORA", "CHEGA NA SUA CIDADE."],
  steps: [
    { n: "01", title: "VOCÊ ENTRA.", text: ["Cadastro em 30 segundos.", "Seu CEP diz onde você conta."] },
    { n: "02", title: "VOCÊ CHAMA.", text: ["Seu link é único.", "Cada pessoa que entra por ele conta para sua cidade e para você."] },
    { n: "03", title: "A BORA CHEGA.", text: ["A cidade ganha força.", "O primeiro treino aberto acontece.", "As vagas de Aluno Fundador são ativadas."] },
  ],
  close: ["QUANTO MAIS GENTE DA SUA CIDADE ENTRAR,", "MAIS PERTO A BORA FICA DE CHEGAR."],
};

export const RANKING = {
  title: ["ONDE A BORA", "VAI CHEGAR PRIMEIRO?"],
  goalLabel: "Meta inicial: 500 pessoas por cidade.",
  people: "pessoas",
  founder: "vagas Founder",
  filterAll: "Todos os estados",
  filterLabel: "Filtrar por estado",
  full: "VER RANKING COMPLETO",
  emptyTitle: ["O RANKING", "COMEÇA COM VOCÊ."],
  emptyText: "Ainda não tem ninguém no mapa. A primeira cidade a aparecer aqui pode ser a sua.",
  ctaEyebrow: "SUA CIDADE NÃO ESTÁ AQUI?",
  ctaTitle: ["SEJA A PRIMEIRA PESSOA", "A COLOCAR ELA NO MAPA."],
  cta: "QUERO A BORA NA MINHA CIDADE",
};

export const SIGNALS = {
  eyebrow: "MAIS CITADAS NAS REDES DA BORA",
  text: "Quando a BORA perguntou nas redes onde as pessoas querem a BORA, essas foram as cidades que mais apareceram. Cadastro é o que coloca a cidade no ranking.",
  badge: "Mais citada nas redes",
};
export const MANIFESTO = {
  lines: ["O BRASIL CORRE.", "O BRASIL TREINA.", "O BRASIL COMEÇA.", "O BRASIL CONTINUA.", "AGORA, O BRASIL PEDE BORA."],
  final: "BORA, VAMOS EM FRENTE.",
};

export const FOUNDING = {
  eyebrow: "FOUNDING 50",
  title: ["VOCÊ NÃO PRECISA", "ESPERAR A BORA CHEGAR."],
  text: "Os primeiros 50 atletas de cada cidade que começarem a treinar com a BORA ganham o status permanente de Aluno Fundador.",
  credential: { label: "ALUNO FUNDADOR", prefix: "BORA" },
  benefits: ["Número de Fundador", "70% de desconto no plano mensal", "Prioridade no primeiro treino aberto", "Prioridade na operação presencial"],
  quote: ["VOCÊ NÃO ENTROU", "DEPOIS QUE A BORA CHEGOU.", "VOCÊ AJUDOU", "A BORA A CHEGAR."],
  cta: "QUERO SER FUNDADOR",
  note: "Vagas limitadas a 50 por cidade. As condições estão na página do programa.",
};

export const ABOUT = {
  title: ["A BORA NÃO É", "UMA PLANILHA."],
  title2: ["É DIREÇÃO,", "SUPORTE", "E COMUNIDADE."],
  pillars: [
    { title: "TREINADOR DE VERDADE", text: "Planejamento individual e acompanhamento, para quem está começando ou para quem tem prova-alvo." },
    { title: "COMUNIDADE REAL", text: "Pessoas que treinam, evoluem e vivem isso juntas, em núcleos pelo Brasil e nas provas." },
    { title: "DO PRIMEIRO TROTE À LINHA DE CHEGADA", text: "Você não precisa estar pronto. Só precisa começar." },
  ],
  distances: ["5K", "10K", "21K", "42K", "TRIATHLON"],
};

export const FAQ = [
  { q: "Quanto custa entrar no movimento?", a: "Nada. O cadastro é gratuito e não gera cobrança." },
  { q: "O que acontece depois que eu me cadastro?", a: "Você entra no grupo da BORA do seu estado, recebe seu link pessoal e acompanha sua cidade no ranking." },
  { q: "Quando a BORA chega na minha cidade?", a: "Quando a cidade mostra que está pronta. A meta inicial é 500 pessoas; aí fazemos o primeiro treino aberto e abrimos as vagas de Aluno Fundador." },
  { q: "E se eu quiser começar a treinar agora?", a: "Pode. A BORA Online já existe, e os primeiros 50 de cada cidade entram como Alunos Fundadores." },
  { q: "Já tenho assessoria ou corro em um clube. Posso entrar?", a: "Pode. Quanto mais corredores na cidade, melhor. Pergunte ao seu clube se ele quer correr junto com a BORA." },
  { q: "O que vocês fazem com meus dados?", a: "Usamos para contar sua cidade, criar o seu BORA ID, te colocar no grupo e falar com você sobre a chegada da BORA. O CPF serve só para garantir um cadastro único por pessoa. Nada de venda de dados. Os detalhes estão no aviso de privacidade." },
  { q: "Como funciona o link de indicação?", a: "Cada pessoa que se cadastra pelo seu link conta para a sua cidade e para o seu nível de embaixador." },
];
export const FAQ_GROUPS = [
  { eyebrow: "SOBRE A CAMPANHA", lede: null as string | null, items: FAQ },
  {
    eyebrow: "SOBRE TREINAR COM A BORA",
    lede: "O que perguntam antes de começar." as string | null,
    items: [
      { q: "Como funciona?", a: "Primeiro a gente quer te conhecer: sua rotina, o seu nível de hoje e aonde você quer chegar. Com isso o seu treinador monta um planejamento individual, que fica no app Runy. Por lá você vê os treinos, registra como foi cada um e recebe o retorno do treinador, que ajusta o plano conforme você evolui." },
      { q: "Como funciona o ponto de apoio?", a: "Nas cidades que têm ponto de apoio, você treina presencial nos dias, horários e locais do seu núcleo, com a equipe BORA e toda a estrutura no lugar. E se você viajar para outra cidade que tem ponto de apoio, pode treinar lá também, mesmo sem ser daquele núcleo." },
      { q: "Dá pra fazer online?", a: "Dá. Você treina com a BORA de qualquer lugar, mesmo que não exista ponto de apoio na sua cidade. Os treinos ficam no app Runy, e o treinador acompanha o seu desempenho, manda orientação e faz os ajustes à distância." },
      { q: "Como falo com o professor?", a: "Direto pelo app Runy. É lá que você tira dúvida, conta como foi o treino e recebe a orientação do treinador sobre o que você já fez." },
      { q: "Onde vejo o treino?", a: "No app Runy, organizados do jeito que o seu planejamento pede. Cada treino vem com a explicação do que fazer, e o app conecta com Garmin, Polar e outros aparelhos, o que facilita registrar e acompanhar a sua evolução." },
    ],
  },
];

export const FINAL = {
  title: ["BORA COLOCAR", "SUA CIDADE", "NO MAPA?"],
};

export const FOOTER = {
  links: [
    { label: "Instagram", href: SITE.instagram, external: true },
    { label: "Já sou aluno", href: SITE.studentUrl, external: true },
    { label: "Aviso de privacidade", href: "/privacidade" },
    { label: "Termos", href: "/termos" },
  ],
  letz: "LETZ BORAAA!!",
  company: "Bora Assessoria LTDA",
  cnpj: "54.366.041/0001-25",
  tagline: "Uma assessoria para todos.",
  contactLabel: "CONTATO",
  contact: [
    { label: "comercial@boraassessoria.com", href: "mailto:comercial@boraassessoria.com" },
    { label: "WhatsApp (31) 98413-3066", href: "https://wa.me/5531984133066", external: true },
    { label: "@bora.assessoria", href: SITE.instagram, external: true },
  ],
};

export const THANKS = {
  eyebrow: "VOCÊ ESTÁ DENTRO.",
  hello: "Olá, {name}.",
  cityLine: "{city} agora tem {n} pessoas querendo a BORA.",
  cityLineOne: "{city} acaba de entrar no mapa. Você é a primeira pessoa.",
  rankLabel: "RANKING NACIONAL",
  goalLabel: "META",
  group: { title: ["ENTRE NO GRUPO", "BORA {uf}"], text: "É onde a gente avisa cada passo até a BORA chegar.", cta: "ENTRAR NO WHATSAPP", soon: "O grupo do seu estado abre em breve. Você recebe o link por WhatsApp." },
  share: {
    title: ["AJUDE SUA CIDADE", "A SUBIR NO RANKING."],
    text: "Cada pessoa que entra pelo seu link conta para {city} e para você.",
    label: "SEU LINK PESSOAL",
    whatsapp: "COMPARTILHAR NO WHATSAPP",
    copy: "COPIAR LINK",
    copied: "LINK COPIADO",
    story: "CRIAR STORY",
    message: "Quero a BORA em {city}. Entra comigo que a gente coloca a cidade no mapa: {link}",
  },
  card: {
    title: ["SUA CARTEIRINHA", "BORA."],
    text: "Seu BORA ID é o seu número no movimento, do #0001 em diante. O QR code abre o seu link pessoal e identifica você nos treinos abertos.",
    label: "BORA ID",
    since: "MEMBRO DESDE",
    campaign: "BORA, VAMOS EM FRENTE",
    save: "SALVAR CARTEIRINHA",
    saveHint: "Abre como imagem para guardar no celular e postar.",
  },
  area: { text: "Sua área fica sempre aberta: foto, dados, perfil público e o desempenho das suas indicações. Para voltar depois, entre com o CPF e a data de nascimento.", cta: "ABRIR MINHA ÁREA" },
  founder: { eyebrow: "QUER COMEÇAR AGORA?", title: "FOUNDING 50", slots: "{n} vagas restantes em {city}.", none: "As 50 vagas de {city} já foram preenchidas.", cta: "CONHECER O PROGRAMA FUNDADOR" },
  qualification: {
    title: ["NOS CONTA MAIS", "SOBRE VOCÊ."],
    text: "Opcional. Ajuda a gente a chegar do jeito certo na sua cidade.",
    steps: [
      [
        { key: "runs", label: "Você já corre?", options: ["Sim, regularmente", "Às vezes", "Estou começando", "Ainda não"] },
        { key: "with", label: "Corre com quem?", options: ["Sozinho", "Com um clube", "Com assessoria", "Com amigos"] },
        { key: "distance", label: "Até que distância você corre hoje?", options: ["Até 5K", "Até 10K", "Até 21K", "Até 42K ou mais"] },
        { key: "goal", label: "Qual seu objetivo?", options: ["Começar", "Voltar a correr", "Primeira prova", "Melhorar o tempo", "Triathlon"] },
      ],
      [
        { key: "open", label: "Participaria de um treino da BORA na sua cidade?", options: ["Com certeza", "Talvez", "Não"] },
        { key: "intent", label: "Treinaria com a BORA se ela existisse aqui?", options: ["Sim", "Depende do preço", "Só presencial", "Não sei ainda"] },
        { key: "price", label: "Quanto você pagaria por mês?", options: ["Até R$ 100", "R$ 100 a R$ 200", "R$ 200 a R$ 300", "Mais de R$ 300"] },
        { key: "club", label: "Qual running club você frequenta?", type: "text" },
        { key: "company", label: "Onde você trabalha?", type: "text" },
      ],
    ],
    next: "CONTINUAR",
    send: "ENVIAR",
    skip: "Pular",
    done: "Valeu. Isso ajuda muito.",
  },
};

export const LOGIN = {
  eyebrow: "ÁREA DO MEMBRO",
  title: ["ENTRE COM SEU", "BORA ID."],
  text: "Use o CPF do cadastro e confirme sua data de nascimento.",
  cpf: "CPF",
  birth: "Data de nascimento",
  cta: "ENTRAR",
  sending: "ENTRANDO…",
  noAccount: "Ainda não está no mapa?",
  signup: "Fazer meu cadastro",
};
export const ME = {
  eyebrow: "MINHA ÁREA",
  hello: "OLÁ, {name}.",
  sub: "Seu BORA ID, suas indicações e o seu perfil em {city}.",
  stats: {
    title: ["SEU DESEMPENHO", "NA CAMPANHA."],
    clicks: "CLIQUES NO SEU LINK",
    signups: "CADASTROS PELO SEU LINK",
    network: "SUA REDE TOTAL",
    rank: "POSIÇÃO DE {city}",
    goal: "META DA CIDADE",
    empty: "Compartilhe seu link e volte aqui para acompanhar.",
  },
  share: { title: ["SEU LINK", "PESSOAL."], text: "Cada pessoa que entra por ele conta para {city} e para você." },
  profile: { title: ["SEU", "PERFIL."], text: "Foto, dados e o que aparece para quem visita a página de {city}." },
  card: { title: ["SUA", "CARTEIRINHA."] },
  logout: "SAIR",
  back: "VER A CAMPANHA",
};
export const PROFILE = {
  photo: "FOTO",
  addPhoto: "ADICIONAR FOTO",
  changePhoto: "TROCAR FOTO",
  removePhoto: "Remover",
  photoHint: "JPG ou PNG. A gente recorta em quadrado.",
  fields: { first_name: "Nome", last_name: "Sobrenome", phone: "WhatsApp", phone2: "Outro telefone (opcional)", email: "E-mail", instagram: "Instagram", bio: "Uma linha sobre você", cep: "CEP" },
  placeholders: { instagram: "@seu.perfil", bio: "Corro desde 2024, quero fazer minha primeira 10K…", cep: "00000-000" },
  cepHint: "Mudou de cidade? Troque o CEP e seu ponto no mapa muda junto.",
  cepCity: "Cidade pelo CEP:",
  publicTitle: "PERFIL PÚBLICO",
  publicLabel: "Mostrar meu perfil na página de {city}",
  publicText: "Quem visitar a página da cidade vê seu nome, a inicial do sobrenome, sua foto, seu Instagram e uma linha sobre você. Serve para quem está chegando se conectar com quem já está.",
  whatsappLabel: "Permitir contato pelo WhatsApp",
  whatsappText: "Mostra um botão que abre uma conversa com você. Seu número não aparece escrito.",
  save: "SALVAR",
  saving: "SALVANDO…",
  saved: "Perfil salvo.",
};
export const MEMBERS = {
  eyebrow: "QUEM JÁ ESTÁ AQUI",
  title: ["MEMBROS EM", "{city}."],
  text: "Pessoas que ativaram o perfil público. Chame, combine um treino, corram juntas.",
  one: "1 membro com perfil público",
  many: "{n} membros com perfil público",
  empty: "Ainda não há perfis públicos em {city}.",
  emptyCta: "Entre na sua área e seja a primeira pessoa a aparecer aqui.",
  enter: "ENTRAR NA MINHA ÁREA",
  instagram: "INSTAGRAM",
  whatsapp: "WHATSAPP",
  message: "Oi, {name}! Vi seu perfil na página da BORA em {city} e quero me conectar.",
  since: "desde {date}",
};
export const CITY_PAGE = {
  eyebrow: "BORA, VAMOS EM FRENTE",
  title: "BORA {city}",
  people: "{n} pessoas já querem a BORA em {city}.",
  one: "{city} acaba de entrar no mapa.",
  goal: "Meta inicial: 500",
  done: "{pct}% concluído",
  next: "Você pode ser a próxima pessoa a colocar {city} no mapa.",
  cta: "QUERO A BORA EM {city}",
  founders: "Alunos Fundadores disponíveis: {n} de 50",
  rankNational: "no ranking nacional",
  rankState: "em {uf}",
  unknownTitle: ["ESSA CIDADE", "AINDA NÃO ESTÁ NO MAPA."],
  unknownText: "Seja a primeira pessoa a colocar ela lá.",
};

export const FOUNDER_PAGE = {
  eyebrow: "FOUNDING 50",
  title: ["ALUNO FUNDADOR", "BORA {city}."],
  what: "Os primeiros 50 de cada cidade que começam a treinar com a BORA Online.",
  gains: ["Número de Fundador", "Badge permanente", "70% de desconto no plano mensal", "Prioridade no primeiro treino aberto", "Prioridade na operação presencial", "Grupo exclusivo"],
  conditionTitle: "CONDIÇÃO DE FUNDADOR",
  condition: ["70% de desconto no plano mensal.", "R$ 84 por mês, em vez de R$ 280.", "Mês a mês no cartão."],
  conditionNote: "O plano mensal da BORA custa R$ 280. O Aluno Fundador paga R$ 84 por mês.",
  includes: ["Treino individual", "App Runy", "Seu treinador junto", "Estrutura da BORA no dia da prova"],
  cta: "COMEÇAR AGORA",
  soon: "O checkout abre junto com as primeiras cidades. Você recebe o aviso no grupo do seu estado.",
  rules: "Regras de cancelamento, renovação e o que acontece quando a BORA abrir a operação presencial na sua cidade ficam na página de termos.",
  slots: "{n} vagas restantes em {city}.",
};

export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
