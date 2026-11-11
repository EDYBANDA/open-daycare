"use client";

import { useEffect, useState } from "react";

const fieldLabel =
  "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldControl =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";

export function AddKidModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex cursor-pointer items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,.7)]"
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
        Agregar niño
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(63,54,46,.45)] p-[40px_24px] animate-modal-overlay-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Agregar niño"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)] animate-modal-card-in"
          >
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-display text-[18px] font-semibold text-[#3F362E]">
                Agregar niño
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer text-[15px] font-extrabold text-[#D9583C]"
              >
                Guardar
              </button>
            </div>

            <div className="px-[26px] py-6">
              <div className={fieldLabel}>NOMBRE COMPLETO</div>
              <input
                placeholder="Ej. Martina López"
                className={`${fieldControl} mb-[18px]`}
              />

              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <div className={fieldLabel}>FECHA DE NACIMIENTO</div>
                  <input placeholder="dd/mm/aaaa" className={fieldControl} />
                </div>
                <div className="flex-1">
                  <div className={fieldLabel}>SALA</div>
                  <div className="relative">
                    <select
                      className={`${fieldControl} cursor-pointer appearance-none pr-10 font-bold`}
                      defaultValue="soles"
                    >
                      <option value="soles">Soles</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#B0A290"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={fieldLabel}>ALERGIAS (ETIQUETAS)</div>
              <input
                placeholder="Ej. Maní, Lactosa"
                className={`${fieldControl} mb-[18px]`}
              />

              <div className={fieldLabel}>NOTAS MÉDICAS</div>
              <textarea
                placeholder="Indicaciones, medicación, contactos…"
                className={`${fieldControl} min-h-[90px] resize-y leading-[1.5]`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
