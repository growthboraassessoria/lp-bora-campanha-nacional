// All public copy for the U.S. version of the campaign, in English. Same keys as ./br.ts.
// Tone: direct, positive, young. Always "BORA". The offer (pricing and the Founder program) is hidden in the
// U.S. for now, so those blocks are re-exported from the Brazilian file and never rendered here.
import { FORM as BR_FORM, THANKS as BR_THANKS } from "./br";

export { FOUNDING, FOUNDER_PAGE, SIGNALS } from "./br";

export const SITE = {
  name: "BORA, Let's Go",
  description: "Want to train with BORA, but we're not near you yet? Sign up and put your city on the map.",
  studentUrl: "https://boraassessoria.com/",
  instagram: "https://www.instagram.com/bora.assessoria/",
  areaLabel: "My area",
  studentLabel: "I'm already a BORA athlete",
  homeAria: "BORA · home",
  navAria: "Shortcuts",
};

export const META = {
  title: "BORA in your city · BORA, Let's Go",
  template: "%s · BORA, Let's Go",
  ogTitle: "BORA in your city.",
  ogLines: ["BORA", "IN YOUR", "CITY."],
  ogTag: "LET'S GO",
  ogFoot: "Put your city on the map.",
  thanks: "You're in",
  me: "My area",
  login: "Sign in to my area",
  ranking: "Where does BORA land first?",
  cityFallback: "City",
  cityTitle: "BORA {city}",
  cityDesc: "See how many people already want BORA in {city}, {uf}. Put your city on the map.",
};

export const MAP = {
  aria: "Map of the United States with the cities already asking for BORA",
};

export const HERO = {
  eyebrow: "BORA, LET'S GO",
  headline: {
    A: ["BORA", "IN YOUR", "CITY."],
    B: ["IS YOUR CITY", "READY FOR", "BORA?"],
  },
  sub: "Want to train with BORA, but we're not near you yet?",
  text: "We're mapping where BORA should land in the U.S. Sign up, bring your friends, and put your city on the map.",
  geo: {
    idle: "SHOW ME ON THE MAP",
    asking: "LOCATING…",
    found: "YOU'RE IN {uf}",
    foundNear: "YOU'RE NEAR {city}",
    outside: "WE COULDN'T FIND YOU ON THE MAP",
    denied: "LOCATION BLOCKED IN YOUR BROWSER",
    unsupported: "YOUR BROWSER DOESN'T SHARE LOCATION",
    you: "YOU",
    hint: "Only with your permission. Your location never leaves your device.",
  },
  legend: { units: "BORA is already here", asking: "Asking for BORA", hot: "Most requested", signal: "Most mentioned on social" },
};

export const FORM = {
  cepTitle: "ENTER YOUR ZIP CODE AND PUT YOUR CITY ON THE MAP.",
  cepLabel: "ZIP CODE",
  cepPlaceholder: "00000",
  cepHelp: "Your ZIP code tells us which city you count for. We don't store your address.",
  resolving: "Finding your city…",
  confirmQuestion: "Is this it?",
  confirmYes: "YES, THAT'S IT",
  confirmFix: "Change city",
  yourCity: "Your city:",
  approxNote: "Approximate location on the map.",
  fields: { first_name: "First name", last_name: "Last name", phone: "Mobile number", email: "Email", cpf: "", birth_date: "Date of birth", sex: "Sex" },
  placeholders: { cpf: "", birth_date: "MM/DD/YYYY", phone: "(555) 555-0123" },
  cpfHelp: "",
  sexOptions: [
    { value: "F", label: "Female" },
    { value: "M", label: "Male" },
    { value: "N", label: "Prefer not to say" },
  ],
  consent: "I agree to the privacy notice.",
  consentLink: "privacy notice",
  smsConsent:
    "Text me updates about BORA in my city. By checking this box, I agree to receive recurring automated marketing text messages from BORA at the mobile number I provided. Consent is not a condition of any purchase. Message and data rates may apply. Reply STOP to opt out or HELP for help." as string | null,
  cityFallback: "your city",
  cta: "I WANT BORA IN MY CITY",
  sending: "PUTTING YOU ON THE MAP…",
  micro: "Takes 30 seconds. No charge.",
  existing: "You're already in. Taking you to your link.",
  placedLine: "You just put {city} on the map.",
  unit: BR_FORM.unit,
};

export const PROOF = {
  aria: "Who's already in",
  people: "PEOPLE",
  cities: "CITIES",
  states: "STATES",
  line: ["RIGHT NOW,", "THE U.S. IS ASKING FOR BORA."],
  empty: ["THE MAP", "STARTS WITH YOU."],
};

export const HOW = {
  title: ["HOW BORA", "GETS TO YOUR CITY."],
  steps: [
    { n: "01", title: "YOU JOIN.", text: ["Sign up in 30 seconds.", "Your ZIP code tells us where you count."] },
    { n: "02", title: "YOU INVITE.", text: ["Your link is yours alone.", "Everyone who joins through it counts for your city and for you."] },
    { n: "03", title: "YOUR CITY CLIMBS.", text: ["The more people join, the higher it goes.", "The cities at the top are the first ones we look at."] },
  ],
  close: ["THE MORE PEOPLE FROM YOUR CITY JOIN,", "THE CLOSER BORA GETS."],
};

export const RANKING = {
  title: ["WHERE DOES BORA", "LAND FIRST?"],
  aria: "City ranking",
  pctAria: "{pct}% of the {goal} goal",
  goalLabel: "First goal: 500 people per city.",
  people: "people",
  founder: "",
  filterAll: "All states",
  filterLabel: "Filter by state",
  full: "SEE THE FULL RANKING",
  emptyTitle: ["THE RANKING", "STARTS WITH YOU."],
  emptyText: "Nobody's on the map yet. The first city to show up here could be yours.",
  ctaEyebrow: "DON'T SEE YOUR CITY?",
  ctaTitle: ["BE THE FIRST", "TO PUT IT ON THE MAP."],
  cta: "I WANT BORA IN MY CITY",
};

export const MANIFESTO = {
  lines: ["AMERICA RUNS.", "AMERICA TRAINS.", "AMERICA STARTS.", "AMERICA KEEPS GOING.", "NOW AMERICA IS ASKING FOR BORA."],
  final: "BORA, LET'S GO.",
  aria: "America is asking for BORA",
};

export const ABOUT = {
  title: ["BORA ISN'T", "A SPREADSHEET."],
  title2: ["IT'S DIRECTION,", "SUPPORT,", "AND COMMUNITY."],
  pillars: [
    { title: "A REAL COACH", text: "An individual plan and real follow-up, whether you're just starting or training for a goal race." },
    { title: "A REAL COMMUNITY", text: "People who train, improve, and live it together, in hubs across Brazil and at the races." },
    { title: "FROM YOUR FIRST JOG TO THE FINISH LINE", text: "You don't have to be ready. You just have to start." },
  ],
  distances: ["5K", "10K", "HALF", "MARATHON", "TRIATHLON"],
  distancesAria: "From the 5K to the triathlon",
  photoAlt: "The BORA community together after a workout",
  note: "BORA comes from Brazil. It's how Brazilians say \"let's go.\"" as string | null,
};

export const TESTIMONIALS = {
  title: ["WHO ALREADY", "RUNS WITH BORA."],
};

export const FAQ_TITLE = ["QUESTIONS,", "ANSWERED."];

export const FAQ = [
  { q: "What does it cost to join?", a: "Nothing. Signing up is free and there's no charge." },
  { q: "What happens after I sign up?", a: "You get your BORA ID and your personal link, and you can follow your city in the ranking. If you opted in to texts, we'll message you when there's news for your city." },
  { q: "When does BORA come to my city?", a: "We're using this map to decide where to go first. The first goal is 500 people per city. When your city gets there, you'll be among the first to hear what's next." },
  { q: "I already have a coach or run with a club. Can I join?", a: "Yes. The more runners in your city, the better. Ask your club if they want in." },
  { q: "What do you do with my data?", a: "We use it to count your city, create your BORA ID, and contact you about BORA in your city. We don't sell your data. The details are in the privacy notice." },
  { q: "How does the referral link work?", a: "Everyone who signs up through your link counts for your city and shows up in your member area." },
];
export const FAQ_GROUPS = [{ eyebrow: "ABOUT THE CAMPAIGN", lede: null as string | null, items: FAQ }];

export const FINAL = {
  title: ["READY TO PUT", "YOUR CITY", "ON THE MAP?"],
};

export const FOOTER = {
  links: [
    { label: "Instagram", href: SITE.instagram, external: true },
    { label: "Privacy notice", href: "/us/privacy" },
    { label: "Terms", href: "/us/terms" },
  ],
  letz: "LETZ BORAAA!!",
  navAria: "Footer",
  company: "Bora Assessoria LTDA",
  cnpj: "54.366.041/0001-25",
  tagline: "",
  legal: "Bora Assessoria LTDA · Belo Horizonte, Brazil · {year}",
  contactLabel: "CONTACT",
  contact: [
    { label: "comercial@boraassessoria.com", href: "mailto:comercial@boraassessoria.com" },
    { label: "@bora.assessoria", href: SITE.instagram, external: true },
  ],
};

export const THANKS = {
  eyebrow: "YOU'RE IN.",
  hello: "Hi, {name}.",
  cityLine: "{city} now has {n} people asking for BORA.",
  cityLineOne: "{city} just hit the map. You're the first one.",
  rankLabel: "U.S. RANKING",
  goalLabel: "GOAL",
  group: BR_THANKS.group,
  share: {
    title: ["HELP YOUR CITY", "CLIMB THE RANKING."],
    text: "Everyone who joins through your link counts for {city} and for you.",
    label: "YOUR PERSONAL LINK",
    primary: "TEXT A FRIEND",
    copy: "COPY LINK",
    copied: "LINK COPIED",
    story: "CREATE STORY",
    message: "I want BORA in {city}. Join me and let's put our city on the map: {link}",
  },
  card: {
    title: ["YOUR BORA", "CARD."],
    text: "Your BORA ID is your number in the movement, starting at #0001. The QR code opens your personal link.",
    label: "BORA ID",
    since: "MEMBER SINCE",
    campaign: "BORA, LET'S GO",
    save: "SAVE MY CARD",
    saveHint: "Opens as an image you can save to your phone and share.",
    aria: "BORA card {id}",
    qrAria: "QR code for the link {link}",
  },
  progressAria: "{city}'s progress",
  area: { text: "Your member area is always open: photo, details, public profile, and how your invites are doing. To come back later, sign in with your mobile number and date of birth.", cta: "OPEN MY AREA" },
  founder: BR_THANKS.founder,
  qualification: {
    title: ["TELL US MORE", "ABOUT YOU."],
    text: "Optional. It helps us show up the right way in your city.",
    steps: [
      [
        { key: "runs", label: "Do you run already?", options: ["Yes, regularly", "Sometimes", "Just starting", "Not yet"] },
        { key: "with", label: "Who do you run with?", options: ["On my own", "With a club", "With a coach", "With friends"] },
        { key: "distance", label: "How far do you run today?", options: ["Up to 5K", "Up to 10K", "Up to a half marathon", "Marathon or more"] },
        { key: "goal", label: "What's your goal?", options: ["Get started", "Get back into running", "My first race", "Get faster", "Triathlon"] },
      ],
      [
        { key: "open", label: "Would you join a BORA group run in your city?", options: ["Definitely", "Maybe", "No"] },
        { key: "intent", label: "Would you train with BORA if it were here?", options: ["Yes", "Depends on the price", "Only in person", "Not sure yet"] },
        { key: "club", label: "Which running club do you run with?", type: "text" },
        { key: "company", label: "Where do you work?", type: "text" },
      ],
    ],
    next: "CONTINUE",
    send: "SEND",
    skip: "Skip",
    done: "Thanks. That helps a lot.",
  },
};

export const LOGIN = {
  eyebrow: "MEMBER AREA",
  title: ["SIGN IN WITH", "YOUR NUMBER."],
  text: "Use the mobile number you signed up with and confirm your date of birth.",
  id: "Mobile number",
  micro: "No charge.",
  birth: "Date of birth",
  cta: "SIGN IN",
  sending: "SIGNING IN…",
  noAccount: "Not on the map yet?",
  signup: "Sign me up",
};
export const ME = {
  eyebrow: "MY AREA",
  hello: "HI, {name}.",
  sub: "Your BORA ID, your invites, and your profile in {city}.",
  stats: {
    title: ["HOW YOU'RE DOING", "IN THE CAMPAIGN."],
    clicks: "CLICKS ON YOUR LINK",
    signups: "SIGN-UPS THROUGH YOUR LINK",
    network: "YOUR WHOLE NETWORK",
    rank: "{city}'S POSITION",
    goal: "CITY GOAL",
    empty: "Share your link and come back to watch it move.",
  },
  share: { title: ["YOUR PERSONAL", "LINK."], text: "Everyone who joins through it counts for {city} and for you." },
  profile: { title: ["YOUR", "PROFILE."], text: "Your photo, your details, and what visitors see on the {city} page." },
  card: { title: ["YOUR", "CARD."] },
  logout: "SIGN OUT",
  back: "SEE THE CAMPAIGN",
};
export const PROFILE = {
  photo: "PHOTO",
  addPhoto: "ADD PHOTO",
  changePhoto: "CHANGE PHOTO",
  removePhoto: "Remove",
  photoHint: "JPG or PNG. We crop it to a square.",
  fields: { first_name: "First name", last_name: "Last name", phone: "Mobile number", phone2: "Another phone (optional)", email: "Email", instagram: "Instagram", bio: "One line about you", cep: "ZIP code" },
  placeholders: { instagram: "@your.handle", bio: "Running since 2024, training for my first 10K…", cep: "00000" },
  cepHint: "Moved? Change your ZIP code and your dot on the map moves with you.",
  cepCity: "City from your ZIP code:",
  publicTitle: "PUBLIC PROFILE",
  publicLabel: "Show my profile on the {city} page",
  publicText: "People who visit your city's page see your first name, last initial, photo, Instagram, and your one-liner. It's how newcomers connect with people who are already in.",
  whatsappLabel: "Let people text me",
  whatsappText: "Shows a button that opens a text message to you. Anyone who taps it will see your number.",
  save: "SAVE",
  saving: "SAVING…",
  saved: "Profile saved.",
};
export const MEMBERS = {
  eyebrow: "ALREADY HERE",
  title: ["MEMBERS IN", "{city}."],
  text: "People who turned on their public profile. Reach out, plan a run, go together.",
  one: "1 member with a public profile",
  many: "{n} members with a public profile",
  empty: "No public profiles in {city} yet.",
  emptyCta: "Sign in to your area and be the first one here.",
  enter: "GO TO MY AREA",
  instagram: "INSTAGRAM",
  contact: "TEXT",
  message: "Hi {name}! I saw your profile on BORA's {city} page and I'd love to connect.",
  since: "since {date}",
};
export const CITY_PAGE = {
  eyebrow: "BORA, LET'S GO",
  title: "BORA {city}",
  people: "{n} people already want BORA in {city}.",
  one: "{city} just hit the map.",
  goal: "First goal: 500",
  done: "{pct}% there",
  next: "You could be the next person to put {city} on the map.",
  cta: "I WANT BORA IN {city}",
  founders: "",
  rankNational: "in the U.S. ranking",
  rankState: "in {uf}",
  unknownTitle: ["THIS CITY", "ISN'T ON THE MAP YET."],
  unknownText: "Be the first to put it there.",
  hint: "Are you in {city}? Confirm with your ZIP code.",
  group: "BORA {uf} group",
  rankIn: "#{n} {where}",
};

/** Text for the images generated on the server: the Instagram story and the card PNG. */
export const IMAGES = {
  tag: "LET'S GO",
  story: {
    ranked: "RANKED",
    entered: "NOW ON THE MAP",
    want: "I WANT BORA HERE.",
    myId: "MY BORA ID",
    people: "{n} PEOPLE · GOAL {goal}",
    person: "1 PERSON · GOAL {goal}",
    goal: "GOAL {goal}",
    scan: "POINT YOUR CAMERA TO JOIN",
    notFound: "Not found",
  },
  card: {
    title: "MY BORA CARD.",
    since: "MEMBER SINCE {date} · {code}",
    scan: "POINT YOUR CAMERA AT THE QR CODE AND JOIN THROUGH MY LINK.",
    unauthorized: "Sign up to get your card.",
  },
};
