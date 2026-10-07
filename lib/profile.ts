// O que o navegador pode ver do próprio cadastro (sem CPF, sem metadados de origem).
import type { Lead } from "@/lib/db/types";

export type SafeLead = ReturnType<typeof safeLead>;

export function safeLead(l: Lead) {
  return {
    first_name: l.first_name,
    last_name: l.last_name,
    phone: l.phone,
    phone2: l.phone2,
    email: l.email,
    instagram: l.instagram,
    bio: l.bio,
    photo_url: l.photo_url,
    public_profile: l.public_profile,
    public_whatsapp: l.public_whatsapp,
    cep: l.cep,
    city: l.city,
    state: l.state,
    city_slug: l.city_slug,
    bora_number: l.bora_number,
    referral_code: l.referral_code,
  };
}
