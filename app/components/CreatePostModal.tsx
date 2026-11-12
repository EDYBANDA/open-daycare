"use client";

import { useEffect, useRef, useState } from "react";
import type { PostKind } from "@/app/data/feed";
import { kids } from "@/app/data/kids";
import {
  buildPostFromForm,
  fileToScaledDataUrl,
  loadStoredPosts,
  saveStoredPosts,
  validatePostForm,
  type PostFormValues,
} from "@/app/lib/posts";

const fieldLabel =
  "mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
const fieldControl =
  "w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] outline-none placeholder:text-[#B6A99B]";
const fieldError = "border-[#D9583C]! placeholder:text-[#D9583C]!";
const fieldMessage = "mt-1 block text-[12px] text-[#D9583C]";

const kidChipBase =
  "flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] py-[6px] pl-[6px] pr-[14px] text-[14px] font-bold";
const kidChipSelected =
  "border-[#3F362E] bg-[#3F362E] text-white";
const kidChipUnselected =
  "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]";

const kindOptions: { value: PostKind; label: string; solid: string; pastel: string }[] = [
  { value: "meal", label: "Comida", solid: "#9A7B1E", pastel: "#F4EAD0" },
  { value: "nap", label: "Siesta", solid: "#7B5FC0", pastel: "#E7DCF6" },
  { value: "activity", label: "Actividad", solid: "#2E89A6", pastel: "#C7E7F1" },
  { value: "achievement", label: "Logro", solid: "#3E9B6C", pastel: "#CFEBD8" },
  { value: "mood", label: "Ánimo", solid: "#C56486", pastel: "#F9D2DE" },
  { value: "photo", label: "Foto", solid: "#D9684A", pastel: "#FBD8CC" },
  { value: "announcement", label: "Anuncio", solid: "#4E72C8", pastel: "#CCD8F4" },
];

const emptyForm: PostFormValues = {
  kidIds: [],
  wholeRoom: false,
  kind: "meal",
  description: "",
  photos: [],
};

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<PostFormValues>(emptyForm);
  const [descriptionError, setDescriptionError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const toggleKid = (kidId: string) => {
    setForm((prev) => ({
      ...prev,
      wholeRoom: false,
      kidIds: prev.kidIds.includes(kidId)
        ? prev.kidIds.filter((id) => id !== kidId)
        : [...prev.kidIds, kidId],
    }));
  };

  const toggleWholeRoom = () => {
    setForm((prev) => ({ ...prev, wholeRoom: !prev.wholeRoom, kidIds: [] }));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const dataUrls = await Promise.all(
      imageFiles.map((file) =>
        fileToScaledDataUrl(file).catch(() => null),
      ),
    );
    const validUrls = dataUrls.filter((url) => url !== null);
    if (validUrls.length === 0) return;
    setForm((prev) => ({
      ...prev,
      photos: [...prev.photos, ...validUrls],
    }));
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, photoIndex) => photoIndex !== index),
    }));
  };

  const handlePublish = () => {
    const errors = validatePostForm(form);
    setDescriptionError(errors.description ?? "");
    if (errors.description) return;
    const post = buildPostFromForm(form, kids);
    saveStoredPosts([post, ...loadStoredPosts()]);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(63,54,46,.45)] p-[40px_24px] animate-modal-overlay-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nueva publicación"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,.35)] animate-modal-card-in"
      >
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-[26px] py-5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[15px] font-bold text-[#94887B]"
          >
            Cancelar
          </button>
          <span className="font-display text-[18px] font-semibold text-[#3F362E]">
            Nueva publicación
          </span>
          <button
            type="button"
            onClick={handlePublish}
            className="cursor-pointer text-[15px] font-extrabold text-[#D9583C]"
          >
            Publicar
          </button>
        </div>

        <div className="px-[26px] py-6">
          <div className={fieldLabel}>PARA</div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {kids.map((kid) => {
              const selected = form.kidIds.includes(kid.id);
              return (
                <button
                  key={kid.id}
                  type="button"
                  onClick={() => toggleKid(kid.id)}
                  className={`${kidChipBase} ${
                    selected ? kidChipSelected : kidChipUnselected
                  }`}
                >
                  <span
                    className="flex size-[26px] items-center justify-center rounded-full font-display text-[13px] font-semibold"
                    style={{ background: kid.avatarBg, color: kid.avatarText }}
                  >
                    {kid.initial}
                  </span>
                  {kid.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={toggleWholeRoom}
              className={`${kidChipBase} px-4! ${
                form.wholeRoom ? kidChipSelected : kidChipUnselected
              }`}
            >
              Toda la sala
            </button>
          </div>

          <div className={fieldLabel}>TIPO</div>
          <div className="mb-[22px] flex flex-wrap gap-[9px]">
            {kindOptions.map((option) => {
              const selected = form.kind === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, kind: option.value }))}
                  className="cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-extrabold"
                  style={{
                    background: selected ? option.solid : option.pastel,
                    color: selected ? "#fff" : option.solid,
                  }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className={fieldLabel}>DESCRIPCIÓN</div>
          <div className="mb-[22px]">
            <textarea
              value={form.description}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, description: e.target.value }));
                setDescriptionError("");
              }}
              placeholder="Contá cómo le fue hoy…"
              className={`${fieldControl} min-h-[120px] resize-y leading-[1.5] ${
                descriptionError ? fieldError : ""
              }`}
            />
            {descriptionError && (
              <span className={fieldMessage}>{descriptionError}</span>
            )}
          </div>

          <div className={fieldLabel}>FOTOS</div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              void handleFiles(event.dataTransfer.files);
            }}
            className="flex flex-wrap gap-3"
          >
            {form.photos.map((photo, index) => (
              <div
                key={photo}
                className="relative size-24 overflow-hidden rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1]"
              >
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  draggable={false}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Quitar foto ${index + 1}`}
                  className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-[rgba(63,54,46,.65)] text-white"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex size-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed bg-[#F4ECE1] text-[#B0A290] ${
                isDragging ? "border-[#C5503A] bg-white" : "border-[#DBCDBA]"
              }`}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C5503A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[12px]">Agregar</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                void handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
