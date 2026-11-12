import type { LinkedParent } from "@/app/data/kids";

export const PARENT_INVITES_STORAGE_KEY = "opendaycare:parent-invites:v1";

export type ParentInvite = {
  id: string;
  kidId: string;
  name: string;
  email: string;
  relation: string;
  code: string;
  createdAt: string;
};

export type InviteFormValues = {
  name: string;
  email: string;
  relation: string;
};

export type InviteFormErrors = { name?: string; email?: string };

const INVITE_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

const PARENT_AVATAR_BGS = [
  "#C9B6E8",
  "#A9C7E8",
  "#F4DC8E",
  "#F4B8CC",
  "#B9DEC4",
];

const emptyInvites: ParentInvite[] = [];
let memoryFallback: ParentInvite[] = emptyInvites;

export function generateInviteCode(): string {
  const random = new Uint32Array(5);
  crypto.getRandomValues(random);
  return Array.from(
    random,
    (value) => INVITE_CODE_ALPHABET[value % INVITE_CODE_ALPHABET.length],
  ).join("");
}

export function validateInviteForm(values: InviteFormValues): InviteFormErrors {
  const errors: InviteFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "El email no es válido";
  }

  return errors;
}

export function buildParentFromInvite(
  invite: ParentInvite,
  parentCount = 0,
): LinkedParent {
  return {
    name: invite.name,
    initial: invite.name.charAt(0).toUpperCase(),
    relation: invite.relation,
    status: "pending",
    avatarBg: PARENT_AVATAR_BGS[parentCount % PARENT_AVATAR_BGS.length],
  };
}

let cachedInvites: ParentInvite[] | null = null;
const listeners = new Set<() => void>();

export function subscribeToInvites(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = () => {
    cachedInvites = null;
    listener();
  };
  window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function loadStoredInvites(): ParentInvite[] {
  if (typeof window === "undefined") return emptyInvites;
  if (cachedInvites) return cachedInvites;
  try {
    const raw = window.localStorage.getItem(PARENT_INVITES_STORAGE_KEY);
    if (!raw) {
      cachedInvites = emptyInvites;
      return cachedInvites;
    }
    const parsed: unknown = JSON.parse(raw);
    cachedInvites = Array.isArray(parsed)
      ? (parsed as ParentInvite[])
      : emptyInvites;
  } catch {
    cachedInvites = memoryFallback;
  }
  return cachedInvites;
}

export function saveStoredInvites(storedInvites: ParentInvite[]): void {
  memoryFallback = storedInvites;
  cachedInvites = storedInvites;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      PARENT_INVITES_STORAGE_KEY,
      JSON.stringify(storedInvites),
    );
  } catch {
    memoryFallback = storedInvites;
  }
  listeners.forEach((listener) => listener());
}
