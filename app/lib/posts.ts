import type { PostKind } from "@/app/data/feed";
import { currentUser } from "@/app/data/feed";
import type { Kid } from "@/app/data/kids";

export const POSTS_STORAGE_KEY = "opendaycare:posts:v1";

export type PostFormValues = {
  kidIds: string[];
  wholeRoom: boolean;
  kind: PostKind;
  description: string;
  photos: string[];
};

export type PostFormErrors = { description?: string };

export type StoredPost = {
  id: string;
  kind: PostKind;
  authorName: string;
  initial?: string;
  time: string;
  audience: string;
  body: string;
  photos: string[];
};

const MAX_PHOTO_EDGE = 480;
const PHOTO_JPEG_QUALITY = 0.7;

const emptyPosts: StoredPost[] = [];
let memoryFallback: StoredPost[] = emptyPosts;
let cachedPosts: StoredPost[] | null = null;
const listeners = new Set<() => void>();

export function subscribeToPosts(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = () => {
    cachedPosts = null;
    listener();
  };
  window.addEventListener("storage", handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function loadStoredPosts(): StoredPost[] {
  if (typeof window === "undefined") return emptyPosts;
  if (cachedPosts) return cachedPosts;
  try {
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) {
      cachedPosts = emptyPosts;
      return cachedPosts;
    }
    const parsed: unknown = JSON.parse(raw);
    cachedPosts = Array.isArray(parsed) ? (parsed as StoredPost[]) : emptyPosts;
  } catch {
    cachedPosts = memoryFallback;
  }
  return cachedPosts;
}

export function saveStoredPosts(posts: StoredPost[]): void {
  memoryFallback = posts;
  cachedPosts = posts;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch {
    const withoutPhotos = posts.map((post) => ({ ...post, photos: [] }));
    try {
      window.localStorage.setItem(
        POSTS_STORAGE_KEY,
        JSON.stringify(withoutPhotos),
      );
    } catch {
      memoryFallback = posts;
    }
  }
  listeners.forEach((listener) => listener());
}

export function validatePostForm(values: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};

  if (!values.description.trim()) {
    errors.description = "La descripción es obligatoria";
  }

  return errors;
}

function formatCurrentTime(now: Date): string {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function buildPostFromForm(
  values: PostFormValues,
  allKids: Kid[],
  now = new Date(),
): StoredPost {
  const selectedKids = allKids.filter((kid) => values.kidIds.includes(kid.id));
  const isRoomWide = values.wholeRoom || selectedKids.length === 0;
  const author = isRoomWide ? currentUser : selectedKids[0];
  const firstNames = selectedKids.map((kid) => kid.name.split(" ")[0]);
  const audience = isRoomWide
    ? "toda la sala"
    : `familia de ${firstNames.join(" y ")}`;

  return {
    id: crypto.randomUUID(),
    kind: values.kind,
    authorName: author.name,
    initial: author.initial,
    time: formatCurrentTime(now),
    audience,
    body: values.description.trim(),
    photos: values.photos,
  };
}

export function fileToScaledDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(
        1,
        MAX_PHOTO_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas no disponible"));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", PHOTO_JPEG_QUALITY));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    image.src = url;
  });
}
