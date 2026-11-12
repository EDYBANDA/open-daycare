"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { CreatePostModal } from "@/app/components/CreatePostModal";
import { currentUser, room } from "@/app/data/feed";

export type SidebarActive = "feed" | "kids";

type NavItem = {
  id: "feed" | "kids" | "notices" | "account";
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    id: "feed",
    label: "Feed",
    href: "/",
    icon: (
      <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
  },
  {
    id: "kids",
    label: "Niños",
    href: "/kids",
    icon: (
      <>
        <circle cx="9" cy="7" r="3" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 20a5 5 0 0 1 5.5-4.9" />
      </>
    ),
  },
  {
    id: "notices",
    label: "Avisos",
    href: "/avisos",
    icon: (
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
    ),
  },
  {
    id: "account",
    label: "Mi cuenta",
    href: "/mi-cuenta",
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export function Sidebar({ active }: { active: SidebarActive }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-[#ECE0D0] bg-[#FFFDF9] px-4 py-6">
      <Link
        href="/"
        className="flex items-center gap-[11px] px-2 pb-[22px] pt-1"
      >
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </div>
        <div>
          <div className="font-display text-[17px] font-semibold leading-none text-[#3F362E]">
            OpenDayCare
          </div>
          <div className="mt-0.5 text-[11.5px] text-[#A89A8B]">{room.name}</div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="mb-[18px] flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,.75)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nueva publicación
      </button>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const isActive = item.id === active;
          const className = isActive
            ? "flex items-center gap-3 rounded-xl bg-[#FBE3D8] px-3 py-[11px] text-[14.5px] font-extrabold text-[#D9583C]"
            : "flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-[#6E6359]";
          const icon = (
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {item.icon}
            </svg>
          );
          // Feed and Niños are real links; Avisos and Mi cuenta are inert (out of scope)
          if (item.id === "feed" || item.id === "kids") {
            return (
              <Link key={item.id} href={item.href} className={className}>
                {icon}
                {item.label}
              </Link>
            );
          }
          return (
            <a key={item.id} className={className}>
              {icon}
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-2.5 border-t border-[#ECE0D0] pt-3.5">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#F2937A] font-display text-[16px] font-semibold text-white">
            {currentUser.initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-[#3F362E]">
              {currentUser.name}
            </div>
            <div className="text-[12px] text-[#A89A8B]">{currentUser.role}</div>
          </div>
          <Link
            href="/login"
            title="Cerrar sesión"
            className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F6ECDF] text-[#94887B]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </Link>
        </div>
      </div>
      </aside>

      {modalOpen && (
        <CreatePostModal onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
