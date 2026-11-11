import Link from "next/link";
import { notFound } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { LinkedParentsCard } from "@/app/components/LinkedParentsCard";
import { kids } from "@/app/data/kids";

export function generateStaticParams() {
  return kids.map((kid) => ({ id: kid.id }));
}

export default async function KidProfilePage(
  props: PageProps<"/kids/[id]">,
) {
  const { id } = await props.params;
  const kid = kids.find((k) => k.id === id);
  if (!kid) notFound();

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar active="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <Link
            href="/kids"
            className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver a Niños
          </Link>

          <div className="flex flex-wrap items-start gap-[26px]">
            <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
              <div className="flex items-center gap-[18px]">
                <div
                  className="flex size-[84px] shrink-0 items-center justify-center rounded-full font-display text-[34px] font-semibold"
                  style={{
                    backgroundColor: kid.avatarBg,
                    color: kid.avatarText,
                  }}
                >
                  {kid.initial}
                </div>
                <div className="flex-1">
                  <h1 className="m-0 font-display text-[28px] font-semibold text-[#3F362E]">
                    {kid.name}
                  </h1>
                  <p className="m-0 mt-[3px] text-[15px] text-[#94887B]">
                    {kid.age} años · Sala {kid.room}
                  </p>
                </div>
                <a className="rounded-xl border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]">
                  Editar
                </a>
              </div>

              {kid.allergyNote ? (
                <div className="flex gap-3.5 rounded-2xl bg-[#FBDAD6] px-[18px] py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                      Alergias y notas
                    </div>
                    <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                      {kid.allergyNote}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9]">
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">
                    Fecha de nacimiento
                  </span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.birthDate}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Sala</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.room}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Ingreso</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.enrollment}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-[300px] flex-none flex-col gap-3.5">
              <a className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[#3F362E] p-[13px] text-[15px] font-extrabold text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
                Resumen del día
              </a>
              <LinkedParentsCard parents={kid.parents} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
