"use client";

import { useSyncExternalStore } from "react";
import { AddKidModal } from "@/app/components/AddKidModal";
import { KidCard } from "@/app/components/KidCard";
import { kids, type Kid } from "@/app/data/kids";
import { loadStoredKids, saveStoredKids, subscribeToKids } from "@/app/lib/kids";

const EMPTY_KIDS: Kid[] = [];

export function KidsBoard() {
  const storedKids = useSyncExternalStore(
    subscribeToKids,
    loadStoredKids,
    () => EMPTY_KIDS,
  );

  const totalKids = kids.length + storedKids.length;

  const handleSave = (kid: Kid) => {
    saveStoredKids([...storedKids, kid]);
  };

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
      <div className="mb-[22px] flex items-end justify-between gap-4">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="m-0 font-display text-[30px] font-semibold text-[#3F362E]">
            Niños
          </h1>
        </div>
        <AddKidModal onSave={handleSave} kidCount={totalKids} />
      </div>

      <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B0A290"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          placeholder="Buscar niño…"
          className="flex-1 border-none bg-transparent text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]"
        />
      </div>

      <div className="mb-3.5 flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#3F362E]">
          SALA SOLES
        </span>
        <span className="text-[13px] text-[#A89A8B]">{totalKids} niños</span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {kids.map((kid) => (
          <KidCard key={kid.id} kid={kid} href={`/kids/${kid.id}`} />
        ))}
        {storedKids.map((kid) => (
          <KidCard key={kid.id} kid={kid} />
        ))}
      </div>
    </div>
  );
}
