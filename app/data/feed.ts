export type PostKind = "achievement" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  kind: PostKind;
  authorName: string;
  initial?: string;
  time: string;
  audience: string;
  body: string;
  photoLabel?: string;
  hearts: number;
  comments: number;
};

export const currentUser = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
};

export const room = {
  name: "Sala Soles",
  childrenCount: 12,
  dateLabel: "martes 17 jun",
};

export const feedPosts: FeedPost[] = [
  {
    id: "1",
    kind: "achievement",
    authorName: "Mateo",
    initial: "M",
    time: "14:20",
    audience: "familia de Mateo",
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    hearts: 3,
    comments: 1,
  },
  {
    id: "2",
    kind: "activity",
    authorName: "Mateo",
    initial: "M",
    time: "09:40",
    audience: "familia de Mateo",
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoLabel: "Foto · pintando con témperas",
    hearts: 5,
    comments: 2,
  },
  {
    id: "3",
    kind: "announcement",
    authorName: "Anuncio general",
    time: "07:50",
    audience: "toda la sala",
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    hearts: 8,
    comments: 0,
  },
];
