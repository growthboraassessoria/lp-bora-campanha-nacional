// Membros com perfil público numa cidade: foto, nome, BORA ID, linha sobre a pessoa e os contatos que ela liberou.
import Link from "next/link";
import type { PublicMember } from "@/lib/db";
import { MEMBERS, fill } from "@/lib/copy";
import { formatBoraId, formatDateBr } from "@/lib/boraid";
import Headline from "./Headline";

export default function MembersList({ members, city }: { members: PublicMember[]; city: string }) {
  return (
    <section className="block members" aria-labelledby="members-title">
      <p className="eyebrow" data-reveal>{MEMBERS.eyebrow}</p>
      <Headline id="members-title" lines={MEMBERS.title.map((l) => fill(l, { city: city.toUpperCase() }))} size="s" className="block__title" green={[1]} />
      <p className="block__text" data-reveal>{MEMBERS.text}</p>
      {members.length ? (
        <>
          <p className="members__count" data-reveal>{members.length === 1 ? MEMBERS.one : fill(MEMBERS.many, { n: members.length })}</p>
          <ul className="members__grid" data-reveal>
            {members.map((m) => {
              const name = `${m.first_name} ${m.last_initial ? `${m.last_initial}.` : ""}`.trim();
              return (
                <li className="member" key={m.id}>
                  <div className="avatar avatar--sm" aria-hidden="true">
                    {m.photo_url ? <img src={m.photo_url} alt="" width={64} height={64} loading="lazy" /> : m.first_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="member__name">{name}</div>
                    <div className="member__id">BORA ID {formatBoraId(m.bora_number)} · {fill(MEMBERS.since, { date: formatDateBr(m.created_at) })}</div>
                    {m.bio ? <p className="member__bio">{m.bio}</p> : null}
                    {m.instagram || m.whatsapp ? (
                      <div className="member__links">
                        {m.instagram ? (
                          <a href={`https://www.instagram.com/${m.instagram}/`} target="_blank" rel="noopener">{MEMBERS.instagram}</a>
                        ) : null}
                        {m.whatsapp ? (
                          <a href={`https://wa.me/55${m.whatsapp}?text=${encodeURIComponent(fill(MEMBERS.message, { name: m.first_name, city }))}`} target="_blank" rel="noopener">{MEMBERS.whatsapp}</a>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <div className="members__empty" data-reveal>
          <p className="lede">{fill(MEMBERS.empty, { city })}</p>
          <p className="body">{MEMBERS.emptyCta}</p>
          <div>
            <Link className="btn btn--outline btn-arrow" href="/entrar">{MEMBERS.enter}</Link>
          </div>
        </div>
      )}
    </section>
  );
}
