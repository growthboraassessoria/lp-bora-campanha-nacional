// Escolhe o armazenamento: Supabase quando configurado; arquivo local em desenvolvimento; nenhum em produção sem configuração.
import "server-only";
import { localStore } from "./local";
import { makeSupabaseStore } from "./supabase";
import type { Store } from "./types";

export * from "./types";

let store: Store | null = null;

const noneStore: Store = {
  kind: "none",
  async upsertCity(c) { return c; },
  async createLead() { throw new Error("Armazenamento não configurado."); },
  async getLeadById() { return null; },
  async getLeadByCode() { return null; },
  async codeExists() { return false; },
  async getLeadByCpf() { return null; },
  async updateLead() { throw new Error("Armazenamento não configurado."); },
  async touchLogin() {},
  async savePhoto() { throw new Error("Armazenamento não configurado."); },
  async publicMembers() { return []; },
  async recordReferralClick() {},
  async recordEvent() {},
  async nationalStats() { return { leads: 0, cities: 0, states: 0 }; },
  async ranking() { return []; },
  async cityStat() { return null; },
  async getCity() { return null; },
  async stateGroupUrl() { return null; },
  async saveQualification() {},
  async referralStats() { return { clicks: 0, signups: 0, network: 0 }; },
  async testimonials() { return []; },
};

export function getStore(): Store {
  if (store) return store;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) store = makeSupabaseStore(url, key);
  else if (process.env.NODE_ENV !== "production" || process.env.DATA_STORE === "local") store = localStore;
  else store = noneStore;
  return store;
}
