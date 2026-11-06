import { currentUser, room } from "@/app/data/feed";

export function FeedHeader() {
  return (
    <div className="mb-6">
      <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
        GUARDERÍA · {room.name.toUpperCase()}
      </div>
      <h1 className="font-display text-[30px] font-semibold text-[#3F362E]">
        Buenas, {currentUser.name.split(" ")[0]}
      </h1>
      <p className="mt-[5px] text-[14.5px] text-[#94887B]">
        {room.childrenCount} niños · {room.dateLabel}
      </p>
    </div>
  );
}
