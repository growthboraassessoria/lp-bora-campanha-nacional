"use client";
// Delay imersiva de 5s na página de obrigado: tela preta, símbolo, frases e pista.
// Depois, as perguntas (opcionais) e, ao terminar ou pular, o pop-up do grupo.
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { fill } from "@/lib/copy";
import { gsap } from "@/lib/gsap";
import { track } from "@/lib/analytics";
import { useCopy } from "./LocaleProvider";
import Headline from "./Headline";
import QualificationForm from "./QualificationForm";

/** Marca da aba: a delay e as perguntas já passaram. Recarregar não repete; um cadastro novo apaga a marca (LeadForm). */
export const SEEN = "bora_thanks_welcome";
const DURATION = 5;
const FOCUSABLE = "a[href], button:not([disabled]), input:not([disabled])";

type Props = { name: string; city: string; uf: string; groupUrl: string | null };

export default function ThanksWelcome({ name, city, uf, groupUrl }: Props) {
  const { THANKS } = useCopy();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<"delay" | "popup">("delay");
  const viewRef = useRef<"questions" | "group">("questions");
  const doneRef = useRef(false);
  const [view, setView] = useState<"questions" | "group">("questions");
  const [off, setOff] = useState(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      sessionStorage.setItem(SEEN, "1");
    } catch {
      /* privado */
    }
    document.documentElement.classList.add("welcome-done");
    document.documentElement.classList.remove("welcome-lock");
    document.querySelectorAll("header, main, footer").forEach((el) => el.removeAttribute("inert"));
    setOff(true);
  }, []);

  const closeOverlay = useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      finish();
      return;
    }
    gsap.to(root, { autoAlpha: 0, duration: 0.35, ease: "power2.in", onComplete: finish });
  }, [finish]);

  const dismissPopup = useCallback(() => {
    track("group_popup_dismiss", { uf, has_group: !!groupUrl });
    closeOverlay();
  }, [closeOverlay, groupUrl, uf]);

  // Das perguntas para o grupo: respondeu ("done") ou pulou ("skip").
  const toGroup = useCallback(
    (how: "done" | "skip") => {
      if (viewRef.current === "group") return;
      viewRef.current = "group";
      if (how === "skip") track("qualification_skip", { uf, source: "thanks" });
      track("group_popup_view", { uf, has_group: !!groupUrl });
      setView("group");
    },
    [groupUrl, uf],
  );

  // A cada troca de conteúdo do pop-up, volta ao topo e põe o foco no primeiro controle.
  useEffect(() => {
    if (phaseRef.current !== "popup") return;
    const card = cardRef.current;
    if (!card) return;
    card.scrollTop = 0;
    const target = view === "group" ? card.querySelector<HTMLElement>("#welcome-join") : card.querySelector<HTMLElement>(".chip");
    target?.focus();
  }, [view]);

  useLayoutEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN) || document.documentElement.classList.contains("welcome-done")) {
        finish();
        return;
      }
    } catch {
      /* segue a delay */
    }

    const root = rootRef.current;
    if (!root) return;
    document.documentElement.classList.add("welcome-lock");
    document.querySelectorAll("header, main, footer").forEach((el) => el.setAttribute("inert", ""));
    track("thanks_welcome_start", { uf, has_group: !!groupUrl });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(root);
    const stage = q(".welcome__stage");
    const dialog = q(".welcome__dialog");
    const lines = q(".welcome__line");
    const ring = q(".welcome__ring-draw");
    const fillBar = q(".welcome__fill");
    const pattern = q(".welcome__pattern");
    const core = q(".welcome__core");

    const openPopup = () => {
      phaseRef.current = "popup";
      root.dataset.welcomePhase = "popup";
      const box = dialog[0] as HTMLElement | undefined;
      if (box) {
        box.removeAttribute("inert");
        box.setAttribute("aria-hidden", "false");
      }
      track("thanks_welcome_complete", { uf, has_group: !!groupUrl });
      track("qualification_view", { uf, source: "thanks" });
      cardRef.current?.querySelector<HTMLElement>(".chip")?.focus();
    };

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(stage, { autoAlpha: 0 });
        gsap.set(root, { backgroundColor: "rgba(0,0,0,0.72)" });
        gsap.set(dialog, { autoAlpha: 1, scale: 1, y: 0 });
        openPopup();
        return;
      }

      gsap.set(lines, { autoAlpha: 0, yPercent: 110 });
      gsap.set(dialog, { autoAlpha: 0, scale: 0.92, y: 28 });
      gsap.set(core, { scale: 0.72, autoAlpha: 0 });
      gsap.set(fillBar, { scaleX: 0, transformOrigin: "left center" });
      if (ring.length) gsap.set(ring, { drawSVG: "0%" });

      const tl = gsap.timeline({ defaults: { ease: "bora" } });
      tl.to(pattern, { rotation: 12, scale: 1.08, duration: DURATION, ease: "none" }, 0);
      tl.to(core, { scale: 1, autoAlpha: 1, duration: 0.9 }, 0.05);
      if (ring.length) tl.to(ring, { drawSVG: "100%", duration: DURATION, ease: "none" }, 0);
      tl.to(fillBar, { scaleX: 1, duration: DURATION, ease: "none" }, 0);
      tl.to(q(".welcome__glow"), { opacity: 0.85, duration: 1.2 }, 0);

      const slot = (DURATION - 0.35) / lines.length;
      lines.forEach((line, i) => {
        const start = 0.28 + i * slot;
        tl.to(line, { autoAlpha: 1, yPercent: 0, duration: 0.55 }, start);
        if (i < lines.length - 1) tl.to(line, { autoAlpha: 0, yPercent: -80, duration: 0.4, ease: "power2.in" }, start + slot - 0.35);
      });

      tl.to(stage, { autoAlpha: 0, y: -16, duration: 0.45, ease: "power2.in" }, DURATION);
      tl.to(root, { backgroundColor: "rgba(0,0,0,0.72)", duration: 0.4 }, DURATION);
      tl.to(dialog, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, onStart: openPopup }, DURATION + 0.12);
    }, root);

    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "popup") return;
      if (e.key === "Escape") {
        e.preventDefault();
        if (viewRef.current === "questions") toGroup("skip");
        else dismissPopup();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter((el) => el.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      ctx.revert();
      if (!doneRef.current) {
        document.documentElement.classList.remove("welcome-lock");
        document.querySelectorAll("header, main, footer").forEach((el) => el.removeAttribute("inert"));
      }
    };
  }, [dismissPopup, finish, groupUrl, toGroup, uf]);

  if (off) return null;

  const lines = THANKS.welcome.lines.map((l) => fill(l, { name, city }));
  const title = THANKS.group.title.map((l) => fill(l, { uf }));
  const aria = fill(THANKS.welcome.aria, { city });
  const asking = view === "questions";

  return (
    <div ref={rootRef} className="welcome" data-welcome-phase="delay" role="presentation">
      <div className="welcome__stage" aria-live="polite" aria-label={aria}>
        <div className="welcome__pattern" aria-hidden="true" />
        <div className="welcome__glow" aria-hidden="true" />
        <div className="welcome__core" aria-hidden="true">
          <svg className="welcome__ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(206,255,0,0.16)" strokeWidth="2" />
            <circle className="welcome__ring-draw" cx="100" cy="100" r="88" fill="none" stroke="#ceff00" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 100 100)" />
          </svg>
          <img src="/brand/simbolo-white.png" alt="" width={80} height={102} />
        </div>
        <p className="welcome__kicker">{THANKS.welcome.kicker}</p>
        <div className="welcome__copy">
          {lines.map((line) => (
            <p key={line} className="welcome__line display display-m">
              {line}
            </p>
          ))}
        </div>
        <div className="welcome__bar" aria-hidden="true">
          <div className="welcome__fill" />
        </div>
      </div>

      <div className="welcome__dialog" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-hidden="true" inert>
        {/* Nas perguntas o fundo não fecha, para ninguém perder as respostas sem querer. */}
        <button type="button" className="welcome__backdrop" tabIndex={-1} aria-hidden="true" onClick={asking ? undefined : dismissPopup} />
        {asking ? (
          <div ref={cardRef} className="welcome__card welcome__card--qual">
            <button type="button" className="welcome__x" aria-label={THANKS.qualification.skip} onClick={() => toGroup("skip")} />
            <p className="eyebrow eyebrow--dot">{fill(THANKS.welcome.questionsEyebrow, { name })}</p>
            <Headline id="welcome-title" lines={THANKS.qualification.title} size="s" green={[1]} />
            <p className="welcome__text">{THANKS.qualification.text}</p>
            <QualificationForm
              onDone={() => toGroup("done")}
              onStep={() => {
                if (cardRef.current) cardRef.current.scrollTop = 0;
              }}
            />
            <button type="button" className="welcome__skip" onClick={() => toGroup("skip")}>
              {THANKS.qualification.skip}
            </button>
          </div>
        ) : (
          <div ref={cardRef} className="welcome__card">
            <button type="button" className="welcome__x" aria-label={THANKS.popup.close} onClick={dismissPopup} />
            <img className="welcome__sticker" src="/brand/sticker-fist-bump-green.webp" alt={THANKS.popup.sticker} width={220} height={220} />
            <p className="eyebrow eyebrow--dot">{THANKS.popup.eyebrow}</p>
            <Headline id="welcome-title" lines={title} size="s" green={[1]} />
            <p className="welcome__text">{groupUrl ? THANKS.popup.text : THANKS.popup.soon}</p>
            {groupUrl ? (
              <a
                id="welcome-join"
                className="btn btn--green btn--block btn-arrow"
                href={groupUrl}
                target="_blank"
                rel="noopener"
                onClick={() => {
                  track("group_join_click", { uf, source: "popup" });
                  closeOverlay();
                }}
              >
                {THANKS.group.cta}
              </a>
            ) : (
              <button id="welcome-join" type="button" className="btn btn--green btn--block" onClick={dismissPopup}>
                {THANKS.popup.continue}
              </button>
            )}
            {groupUrl ? (
              <button type="button" className="welcome__skip" onClick={dismissPopup}>
                {THANKS.popup.skip}
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
