export type ParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;
  initial: string;
  relation: string;
  status: ParentStatus;
  avatarBg: string;
};

export type Kid = {
  id: string;
  name: string;
  initial: string;
  age: number;
  avatarBg: string;
  avatarText: string;
  allergyLabel?: string;
  allergyNote?: string;
  birthDate: string;
  room: string;
  enrollment: string;
  parents: LinkedParent[];
};

export const kids: Kid[] = [
  {
    id: "mateo",
    name: "Mateo Fernández",
    initial: "M",
    age: 3,
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    allergyLabel: "MANÍ",
    allergyNote:
      "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    birthDate: "12 mar 2022",
    room: "Soles",
    enrollment: "feb 2025",
    parents: [
      {
        name: "Lucía Fernández",
        initial: "L",
        relation: "Mamá",
        status: "active",
        avatarBg: "#C9B6E8",
      },
      {
        name: "Diego Fernández",
        initial: "D",
        relation: "Papá",
        status: "pending",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "sofia",
    name: "Sofía Méndez",
    initial: "S",
    age: 2,
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    birthDate: "8 jul 2024",
    room: "Soles",
    enrollment: "mar 2026",
    parents: [
      {
        name: "Carolina Méndez",
        initial: "C",
        relation: "Mamá",
        status: "active",
        avatarBg: "#F4B8CC",
      },
    ],
  },
  {
    id: "benjamin",
    name: "Benjamín Ruiz",
    initial: "B",
    age: 3,
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    birthDate: "23 sep 2022",
    room: "Soles",
    enrollment: "ago 2025",
    parents: [
      {
        name: "Marta Ruiz",
        initial: "M",
        relation: "Mamá",
        status: "active",
        avatarBg: "#C9B6E8",
      },
      {
        name: "Javier Ruiz",
        initial: "J",
        relation: "Papá",
        status: "active",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "valentina",
    name: "Valentina Soto",
    initial: "V",
    age: 2,
    avatarBg: "#F4DC8E",
    avatarText: "#9A7B1E",
    birthDate: "14 ene 2024",
    room: "Soles",
    enrollment: "feb 2026",
    parents: [],
  },
  {
    id: "tomas",
    name: "Tomás Díaz",
    initial: "T",
    age: 3,
    avatarBg: "#C9B6E8",
    avatarText: "#7B5FC0",
    allergyLabel: "LACTOSA",
    allergyNote:
      "Intolerancia a la lactosa. Toma leche vegetal que traen de casa.",
    birthDate: "30 nov 2022",
    room: "Soles",
    enrollment: "sep 2025",
    parents: [
      {
        name: "Paula Díaz",
        initial: "P",
        relation: "Mamá",
        status: "active",
        avatarBg: "#F4DC8E",
      },
    ],
  },
  {
    id: "emma",
    name: "Emma Castro",
    initial: "E",
    age: 2,
    avatarBg: "#F4B8CC",
    avatarText: "#C44A7A",
    birthDate: "5 may 2024",
    room: "Soles",
    enrollment: "feb 2026",
    parents: [
      {
        name: "Natalia Castro",
        initial: "N",
        relation: "Mamá",
        status: "active",
        avatarBg: "#B9DEC4",
      },
    ],
  },
  {
    id: "lucas",
    name: "Lucas Romero",
    initial: "L",
    age: 3,
    avatarBg: "#A9D9E8",
    avatarText: "#1F7A93",
    birthDate: "19 feb 2023",
    room: "Soles",
    enrollment: "ago 2025",
    parents: [
      {
        name: "Andrés Romero",
        initial: "A",
        relation: "Papá",
        status: "active",
        avatarBg: "#A9C7E8",
      },
    ],
  },
  {
    id: "olivia",
    name: "Olivia Vega",
    initial: "O",
    age: 2,
    avatarBg: "#B9DEC4",
    avatarText: "#3E8B62",
    birthDate: "27 oct 2024",
    room: "Soles",
    enrollment: "mar 2026",
    parents: [
      {
        name: "Lucía Vega",
        initial: "L",
        relation: "Mamá",
        status: "pending",
        avatarBg: "#F4DC8E",
      },
    ],
  },
];
