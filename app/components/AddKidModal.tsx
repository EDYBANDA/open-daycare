"use client";

import { useEffect, useState } from "react";
import type { Kid } from "@/app/data/kids";
import { buildKidFromForm, validateKidForm } from "@/app/lib/kids";

const fieldLabel =
  "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldControl =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";
const fieldError = "border-[#D9583C]! placeholder:text-[#D9583C]!";
const fieldMessage = "mt-1 block text-[12px] text-[#D9583C]";

const emptyForm = {
  name: "",
  birthDate: "",
  room: "soles",
  allergies: "",
  medicalNotes: "",
};

function isValidDate(dd: number, mm: number, yyyy: number): boolean {
  const date = new Date(yyyy, mm - 1, dd);
  return (
    date.getFullYear() === yyyy &&
    date.getMonth() === mm - 1 &&
    date.getDate() === dd
  );
}

export function AddKidModal({
  onSave,
  kidCount = 0,
}: {
  onSave?: (kid: Kid) => void;
  kidCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [nameError, setNameError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPos = e.target.selectionStart || 0;
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    if (digits.length > 4) formatted = formatted.slice(0, 5) + "/" + digits.slice(4);
    setField("birthDate", formatted);

    const diff = formatted.length - raw.length;
    requestAnimationFrame(() => {
      const newPos = Math.min(cursorPos + diff, formatted.length);
      e.target.setSelectionRange(newPos, newPos);
    });

    if (formatted.length === 10) {
      const parts = formatted.split("/");
      const dd = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const yyyy = parseInt(parts[2], 10);
      if (!isValidDate(dd, mm, yyyy)) {
        setBirthDateError("Fecha inválida");
      } else {
        setBirthDateError("");
      }
    } else {
      setBirthDateError("");
    }
  };

  const openModal = () => {
    setForm(emptyForm);
    setNameError("");
    setBirthDateError("");
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleSave = () => {
    const errors = validateKidForm(form);
    setNameError(errors.name ?? "");
    setBirthDateError(errors.birthDate ?? "");
    if (errors.name || errors.birthDate) return;
    onSave?.(buildKidFromForm(form, kidCount));
    setForm(emptyForm);
    closeModal();
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
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
        onClick={openModal}
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
          onClick={closeModal}
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
          onClick={closeModal}
                className="cursor-pointer text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span className="font-display text-[18px] font-semibold text-[#3F362E]">
                Agregar niño
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="cursor-pointer text-[15px] font-extrabold text-[#D9583C]"
              >
                Guardar
              </button>
            </div>

            <div className="px-[26px] py-6">
              <div className="mb-[18px]">
                <div className={fieldLabel}>NOMBRE COMPLETO</div>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    setNameError("");
                  }}
                  placeholder="Ej. Martina López"
                  className={`${fieldControl} ${nameError ? fieldError : ""}`}
                />
                {nameError && (
                  <span className={fieldMessage}>{nameError}</span>
                )}
              </div>

              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <div className={fieldLabel}>FECHA DE NACIMIENTO</div>
                  <input
                    value={form.birthDate}
                    onChange={handleBirthDateChange}
                    placeholder="dd/mm/aaaa"
                    className={`${fieldControl} ${birthDateError ? fieldError : ""}`}
                  />
                  {birthDateError && (
                    <span className={fieldMessage}>{birthDateError}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={fieldLabel}>SALA</div>
                  <div className="relative">
                    <select
                      value={form.room}
                      onChange={(e) => setField("room", e.target.value)}
                      className={`${fieldControl} cursor-pointer appearance-none pr-10 font-bold`}
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
                value={form.allergies}
                onChange={(e) => setField("allergies", e.target.value)}
                placeholder="Ej. Maní, Lactosa"
                className={`${fieldControl} mb-[18px]`}
              />

              <div className={fieldLabel}>NOTAS MÉDICAS</div>
              <textarea
                value={form.medicalNotes}
                onChange={(e) => setField("medicalNotes", e.target.value)}
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
