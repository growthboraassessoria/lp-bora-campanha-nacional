"use client";
// Perfil do membro: foto (recortada no navegador), dados, telefones, Instagram, linha sobre você, CEP e perfil público.
import { useRef, useState, type FormEvent } from "react";
import { PROFILE, fill } from "@/lib/copy";
import { MESSAGES, formatCep, formatPhone, validateProfile, type ProfileErrors } from "@/lib/validation";
import type { SafeLead } from "@/lib/profile";
import { track } from "@/lib/analytics";

type Props = { lead: SafeLead };

async function squareJpeg(file: File, size = 512): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("imagem"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const s = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ProfileForm({ lead }: Props) {
  const [f, setF] = useState({
    first_name: lead.first_name,
    last_name: lead.last_name,
    phone: formatPhone(lead.phone),
    phone2: lead.phone2 ? formatPhone(lead.phone2) : "",
    email: lead.email,
    instagram: lead.instagram ? `@${lead.instagram}` : "",
    bio: lead.bio ?? "",
    cep: formatCep(lead.cep),
  });
  const [pub, setPub] = useState(lead.public_profile);
  const [wa, setWa] = useState(lead.public_whatsapp);
  const [photo, setPhoto] = useState<string | null>(lead.photo_url);
  const [photoChange, setPhotoChange] = useState<string | null | undefined>(undefined); // undefined = sem mudança
  const [city, setCity] = useState({ city: lead.city, state: lead.state });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof f) => (v: string) =>
    setF((o) => ({ ...o, [k]: k === "phone" || k === "phone2" ? formatPhone(v) : k === "cep" ? formatCep(v) : v }));

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    try {
      const data = await squareJpeg(file);
      setPhoto(data);
      setPhotoChange(data);
      setErrors((e) => ({ ...e, photo: undefined }));
    } catch {
      setErrors((e) => ({ ...e, photo: MESSAGES.photo }));
    }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving) return;
    const errs = validateProfile({ ...f, phone: f.phone, phone2: f.phone2 });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = { ...f, cep: f.cep.replace(/\D/g, ""), public_profile: pub, public_whatsapp: wa };
      if (photoChange !== undefined) body.photo = photoChange;
      const r = await fetch("/api/perfil", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = (await r.json()) as { ok: boolean; lead?: SafeLead; errors?: ProfileErrors; error?: string; unit?: { city: string; url: string } };
      if (!d.ok) {
        if (d.errors) setErrors(d.errors);
        setMsg({ kind: "err", text: d.error ?? (d.unit ? `${d.errors?.cep ?? ""}` : MESSAGES.generic) });
        setSaving(false);
        return;
      }
      if (d.lead) {
        setCity({ city: d.lead.city, state: d.lead.state });
        setPhoto(d.lead.photo_url);
        setPhotoChange(undefined);
      }
      setMsg({ kind: "ok", text: PROFILE.saved });
      track("profile_saved_client", { public: pub });
    } catch {
      setMsg({ kind: "err", text: MESSAGES.generic });
    } finally {
      setSaving(false);
    }
  }

  const initials = (f.first_name || lead.first_name).charAt(0).toUpperCase();
  const fields = [
    { k: "first_name" as const, type: "text", mode: "text" as const, ac: "given-name" },
    { k: "last_name" as const, type: "text", mode: "text" as const, ac: "family-name" },
    { k: "phone" as const, type: "tel", mode: "tel" as const, ac: "tel-national" },
    { k: "phone2" as const, type: "tel", mode: "tel" as const, ac: "off" },
    { k: "email" as const, type: "email", mode: "email" as const, ac: "email" },
    { k: "instagram" as const, type: "text", mode: "text" as const, ac: "off", placeholder: PROFILE.placeholders.instagram },
  ];

  return (
    <form className="panel profile" onSubmit={submit} noValidate aria-live="polite">
      <div className="profile__photo">
        <div className="avatar" aria-hidden="true">{photo ? <img src={photo} alt="" width={96} height={96} /> : initials}</div>
        <div>
          <p className="field__label">{PROFILE.photo}</p>
          <div className="profile__photo-actions" style={{ marginTop: 8 }}>
            <button type="button" className="btn btn--outline" onClick={() => fileRef.current?.click()}>{photo ? PROFILE.changePhoto : PROFILE.addPhoto}</button>
            {photo ? (
              <button type="button" className="confirm__fix" onClick={() => { setPhoto(null); setPhotoChange(null); }}>{PROFILE.removePhoto}</button>
            ) : null}
            <input ref={fileRef} id="perfil-foto" type="file" accept="image/*" className="sr-only" onChange={(e) => pickPhoto(e.target.files?.[0])} />
          </div>
          <p className="profile__hint" style={{ marginTop: 6 }}>{errors.photo ? <span className="panel__err">{errors.photo}</span> : PROFILE.photoHint}</p>
        </div>
      </div>

      <div className="fields">
        {fields.map((x) => (
          <div className="field" key={x.k}>
            <label className="field__label" htmlFor={`perfil-${x.k}`}>{PROFILE.fields[x.k]}</label>
            <input id={`perfil-${x.k}`} className="field__input" type={x.type} inputMode={x.mode} autoComplete={x.ac} placeholder={x.placeholder} value={f[x.k]} onChange={(e) => set(x.k)(e.target.value)} aria-invalid={!!errors[x.k]} />
            <span className="field__error">{errors[x.k] ?? ""}</span>
          </div>
        ))}
        <div className="field field--full">
          <label className="field__label" htmlFor="perfil-bio">{PROFILE.fields.bio}</label>
          <input id="perfil-bio" className="field__input" type="text" maxLength={140} placeholder={PROFILE.placeholders.bio} value={f.bio} onChange={(e) => set("bio")(e.target.value)} aria-invalid={!!errors.bio} />
          <span className="field__error">{errors.bio ?? ""}</span>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="perfil-cep">{PROFILE.fields.cep}</label>
          <input id="perfil-cep" className="field__input" inputMode="numeric" autoComplete="postal-code" placeholder={PROFILE.placeholders.cep} maxLength={9} value={f.cep} onChange={(e) => set("cep")(e.target.value)} aria-invalid={!!errors.cep} />
          <span className="field__error">{errors.cep ?? ""}</span>
        </div>
        <div className="field profile__cep">
          <span>
            {PROFILE.cepCity} <b>{city.city} · {city.state}</b>
          </span>
          <span className="profile__hint">{PROFILE.cepHint}</span>
        </div>
      </div>

      <div>
        <p className="field__label">{PROFILE.publicTitle}</p>
        <label className="toggle">
          <input type="checkbox" id="perfil-publico" checked={pub} onChange={(e) => { setPub(e.target.checked); if (!e.target.checked) setWa(false); }} />
          <span>
            <span className="toggle__label">{fill(PROFILE.publicLabel, { city: city.city })}</span>
            <span className="toggle__text">{PROFILE.publicText}</span>
          </span>
        </label>
        <label className="toggle" style={{ opacity: pub ? 1 : 0.5 }}>
          <input type="checkbox" id="perfil-whatsapp" checked={wa} disabled={!pub} onChange={(e) => setWa(e.target.checked)} />
          <span>
            <span className="toggle__label">{PROFILE.whatsappLabel}</span>
            <span className="toggle__text">{PROFILE.whatsappText}</span>
          </span>
        </label>
      </div>

      <div>
        <button type="submit" className="btn btn--green btn--lg btn--block" disabled={saving}>{saving ? PROFILE.saving : PROFILE.save}</button>
        <p className="panel__micro" role="status">{msg ? <span className={msg.kind === "ok" ? "panel__msg" : "panel__err"}>{msg.text}</span> : ""}</p>
      </div>
    </form>
  );
}
