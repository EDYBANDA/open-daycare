import type { Kid } from "@/app/data/kids";

export const KIDS_STORAGE_KEY = "opendaycare:kids:v1";

export type KidFormValues = {
  name: string;
  birthDate: string;
  room: string;
  allergies: string;
  medicalNotes: string;
};

export type KidFormErrors = { name?: string; birthDate?: string };

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const AVATAR_COLORS = [
  { bg: "#A9D9E8", text: "#1F7A93" },
  { bg: "#F4B8CC", text: "#C44A7A" },
  { bg: "#B9DEC4", text: "#3E8B62" },
  { bg: "#F4DC8E", text: "#9A7B1E" },
  { bg: "#C9B6E8", text: "#7B5FC0" },
];

let memoryFallback: Kid[] = [];

function isCompleteBirthDate(value: string): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
}

function isRealDate(dd: number, mm: number, yyyy: number): boolean {
  const date = new Date(yyyy, mm - 1, dd);
  return (
    date.getFullYear() === yyyy &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd
  );
}

function isFutureDate(dd: number, mm: number, yyyy: number): boolean {
  const today = new Date();
  const birth = new Date(yyyy, mm - 1, dd);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return birth.getTime() > todayStart.getTime();
}

function parseBirthDate(value: string): Date {
  const [dd, mm, yyyy] = value.split("/").map((part) => parseInt(part, 10));
  return new Date(yyyy, mm - 1, dd);
}

function completedYears(birth: Date, today: Date): number {
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return Math.max(age, 0);
}

export function validateKidForm(values: KidFormValues): KidFormErrors {
  const errors: KidFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "El nombre es obligatorio";
  }

  if (!isCompleteBirthDate(values.birthDate)) {
    errors.birthDate = "Fecha incompleta";
  } else {
    const [dd, mm, yyyy] = values.birthDate
      .split("/")
      .map((part) => parseInt(part, 10));
    if (!isRealDate(dd, mm, yyyy)) {
      errors.birthDate = "Fecha inválida";
    } else if (isFutureDate(dd, mm, yyyy)) {
      errors.birthDate = "La fecha no puede ser futura";
    }
  }

  return errors;
}

export function buildKidFromForm(values: KidFormValues, kidCount = 0): Kid {
  const name = values.name.trim();
  const birthDate = parseBirthDate(values.birthDate);
  const today = new Date();
  const color = AVATAR_COLORS[kidCount % AVATAR_COLORS.length];
  const labels = values.allergies
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  const notes = values.medicalNotes.trim();
  const noteParts: string[] = [];
  if (labels.length > 0) noteParts.push(`Alergias: ${labels.join(", ")}`);
  if (notes.length > 0) noteParts.push(notes);

  return {
    id: crypto.randomUUID(),
    name,
    initial: name.charAt(0).toUpperCase(),
    age: completedYears(birthDate, today),
    avatarBg: color.bg,
    avatarText: color.text,
    allergyLabel: labels.length > 0 ? labels[0].toUpperCase() : undefined,
    allergyNote: noteParts.length > 0 ? noteParts.join(". ") : undefined,
    birthDate: `${birthDate.getDate()} ${MONTHS[birthDate.getMonth()]} ${birthDate.getFullYear()}`,
    room: values.room === "soles" ? "Soles" : values.room,
    enrollment: `${MONTHS[today.getMonth()]} ${today.getFullYear()}`,
    parents: [],
  };
}

export function loadStoredKids(): Kid[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KIDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Kid[]) : [];
  } catch {
    return memoryFallback;
  }
}

export function saveStoredKids(storedKids: Kid[]): void {
  memoryFallback = storedKids;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KIDS_STORAGE_KEY, JSON.stringify(storedKids));
  } catch {
    memoryFallback = storedKids;
  }
}
