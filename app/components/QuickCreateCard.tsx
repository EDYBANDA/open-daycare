import { currentUser } from "@/app/data/feed";

export function QuickCreateCard() {
  return (
    <a className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,.4)]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F2937A] font-display text-[16px] font-semibold text-white">
        {currentUser.initial}
      </div>
      <span className="flex-1 text-[15px] text-[#A89A8B]">
        Compartí un momento…
      </span>
      <span className="flex size-[38px] items-center justify-center rounded-xl bg-[#FBE3D8] text-[#E0654A]">
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
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </span>
    </a>
  );
}
