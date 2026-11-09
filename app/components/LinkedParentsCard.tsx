import type { LinkedParent } from "@/app/data/kids";

const statusConfig = {
  active: {
    subtitle: "activa",
    badgeClass: "bg-[#CFEBD8] text-[#3E9B6C]",
    badgeLabel: "ACTIVA",
  },
  pending: {
    subtitle: "invitación enviada",
    badgeClass: "bg-[#F7E7A6] text-[#9A7B1E]",
    badgeLabel: "PENDIENTE",
  },
} as const;

export function LinkedParentsCard({ parents }: { parents: LinkedParent[] }) {
  return (
    <div className="rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-4">
      <div className="mb-3.5 text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
        PADRES VINCULADOS
      </div>
      <div className="flex flex-col gap-3.5">
        {parents.map((parent) => {
          const status = statusConfig[parent.status];
          return (
            <div key={parent.name} className="flex items-center gap-3">
              <div
                className="flex size-10 shrink-0 items-center justify-center rounded-full font-display text-[16px] font-semibold text-white"
                style={{ backgroundColor: parent.avatarBg }}
              >
                {parent.initial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-extrabold text-[#3F362E]">
                  {parent.name}
                </div>
                <div className="text-[12.5px] text-[#A89A8B]">
                  {parent.relation} · {status.subtitle}
                </div>
              </div>
              <span
                className={`flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold ${status.badgeClass}`}
              >
                {status.badgeLabel}
              </span>
            </div>
          );
        })}
        <a className="flex items-center gap-3 pt-2">
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
        </a>
      </div>
    </div>
  );
}
