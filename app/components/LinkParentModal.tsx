"use client";

import { useEffect, useState } from "react";
import type { ParentInvite } from "@/app/lib/parent-invites";
import {
  generateInviteCode,
  validateInviteForm,
} from "@/app/lib/parent-invites";

const fieldLabel =
  "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldLabelLoose =
  "mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldControl =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";
const fieldError = "border-[#D9583C]! placeholder:text-[#D9583C]!";
const fieldMessage = "mt-1 block text-[12px] text-[#D9583C]";

const pillBase =
  "flex-1 cursor-pointer rounded-full border-[1.5px] py-[11px] text-center text-[14px] font-extrabold";
const pillSelected = "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]";
const pillUnselected = "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]";

const RELATIONS = ["Mamá", "Papá", "Tutor/a"];

const emptyForm = { name: "", email: "", relation: "Mamá" };

export function LinkParentModal({
  kidId,
  kidName,
  onSend,
}: {
  kidId: string;
  kidName: string;
  onSend?: (invite: ParentInvite) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [code, setCode] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openModal = () => {
    setForm(emptyForm);
    setCode(generateInviteCode());
    setNameError("");
    setEmailError("");
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleSend = () => {
    const errors = validateInviteForm(form);
    setNameError(errors.name ?? "");
    setEmailError(errors.email ?? "");
    if (errors.name || errors.email) return;
    const invite: ParentInvite = {
      id: crypto.randomUUID(),
      kidId,
      name: form.name.trim(),
      email: form.email.trim(),
      relation: form.relation,
      code,
      createdAt: new Date().toISOString(),
    };
    onSend?.(invite);
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
        className="flex cursor-pointer items-center gap-3 pt-2"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <span className="text-[14.5px] font-extrabold text-[#C5503A]">
          Vincular otro padre
        </span>
      </button>

      {open && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(63,54,46,.45)] p-[40px_24px] animate-modal-overlay-in"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vincular padre"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)] animate-modal-card-in"
          >
            <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
              <div>
                <div className="font-display text-[18px] font-semibold text-[#3F362E]">
                  Vincular padre
                </div>
                <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Cerrar"
                className="flex size-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-[26px] py-[22px]">
              <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
                <svg
                  className="mt-px flex-none"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4E72C8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
                  Le enviaremos un correo con un código para que active su
                  cuenta. Solo verá el feed de {kidName}.
                </span>
              </div>

              <div className="mb-[18px]">
                <div className={fieldLabel}>NOMBRE DEL PADRE/MADRE</div>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    setNameError("");
                  }}
                  placeholder="Ej. Diego Fernández"
                  className={`${fieldControl} ${nameError ? fieldError : ""}`}
                />
                {nameError && <span className={fieldMessage}>{nameError}</span>}
              </div>

              <div className="mb-[18px]">
                <div className={fieldLabel}>EMAIL</div>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setField("email", e.target.value);
                    setEmailError("");
                  }}
                  placeholder="correo@ejemplo.com"
                  className={`${fieldControl} ${emailError ? fieldError : ""}`}
                />
                {emailError && (
                  <span className={fieldMessage}>{emailError}</span>
                )}
              </div>

              <div className="mb-5">
                <div className={fieldLabelLoose}>PARENTESCO</div>
                <div className="flex gap-[9px]">
                  {RELATIONS.map((relation) => (
                    <button
                      key={relation}
                      type="button"
                      onClick={() => setField("relation", relation)}
                      className={`${pillBase} ${
                        form.relation === relation ? pillSelected : pillUnselected
                      }`}
                    >
                      {relation}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
                <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
                  CÓDIGO DE INVITACIÓN
                </div>
                <div className="font-display text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
                  {code}
                </div>
                <div className="mt-[6px] text-[13px] text-[#A88526]">
                  Vence en 7 días
                </div>
              </div>

              <button
                type="button"
                onClick={handleSend}
                className="flex w-full cursor-pointer items-center justify-center gap-[9px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,.7)]"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m22 2-7 20-4-9-9-4z" />
                  <path d="M22 2 11 13" />
                </svg>
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
