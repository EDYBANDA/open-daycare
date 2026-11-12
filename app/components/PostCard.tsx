import type { FeedPost, PostKind } from "@/app/data/feed";

type KindConfig = {
  label: string;
  badgeClass: string;
  badgeTextClass: string;
  dotClass: string;
  avatarClass: string;
};

const kindConfig: Record<PostKind, KindConfig> = {
  achievement: {
    label: "LOGRO",
    badgeClass: "bg-[#CFEBD8]",
    badgeTextClass: "text-[#3E9B6C]",
    dotClass: "bg-[#3E9B6C]",
    avatarClass: "bg-[#A9D9E8] text-[#1F7A93]",
  },
  activity: {
    label: "ACTIVIDAD",
    badgeClass: "bg-[#C7E7F1]",
    badgeTextClass: "text-[#2E89A6]",
    dotClass: "bg-[#2E89A6]",
    avatarClass: "bg-[#A9D9E8] text-[#1F7A93]",
  },
  announcement: {
    label: "ANUNCIO",
    badgeClass: "bg-[#CCD8F4]",
    badgeTextClass: "text-[#4E72C8]",
    dotClass: "bg-[#4E72C8]",
    avatarClass: "bg-[#CCD8F4] text-[#4E72C8]",
  },
  meal: {
    label: "COMIDA",
    badgeClass: "bg-[#F4EAD0]",
    badgeTextClass: "text-[#9A7B1E]",
    dotClass: "bg-[#9A7B1E]",
    avatarClass: "bg-[#F4EAD0] text-[#9A7B1E]",
  },
  mood: {
    label: "ÁNIMO",
    badgeClass: "bg-[#F9D2DE]",
    badgeTextClass: "text-[#C56486]",
    dotClass: "bg-[#C56486]",
    avatarClass: "bg-[#F9D2DE] text-[#C56486]",
  },
  nap: {
    label: "SIESTA",
    badgeClass: "bg-[#E7DCF6]",
    badgeTextClass: "text-[#7B5FC0]",
    dotClass: "bg-[#7B5FC0]",
    avatarClass: "bg-[#E7DCF6] text-[#7B5FC0]",
  },
  photo: {
    label: "FOTO",
    badgeClass: "bg-[#FBD8CC]",
    badgeTextClass: "text-[#D9684A]",
    dotClass: "bg-[#D9684A]",
    avatarClass: "bg-[#FBD8CC] text-[#D9684A]",
  },
};

export function PostCard({ post }: { post: FeedPost }) {
  const config = kindConfig[post.kind];

  return (
    <article className="rounded-[20px] border border-[#ECE0D0] bg-[#FFFDF9] px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,.5)]">
      <div className="mb-3.5 flex items-center gap-3">
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-full font-display text-[17px] font-semibold ${config.avatarClass}`}
        >
          {post.initial ?? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="font-display text-[16.5px] font-semibold text-[#3F362E]">
            {post.authorName}
          </div>
          <div className="text-[12.5px] text-[#A89A8B]">
            {post.time} · publicado por vos
          </div>
        </div>
        <div
          className={`flex items-center gap-[7px] rounded-full px-3 py-1.5 ${config.badgeClass}`}
        >
          <span className={`size-2 rounded-full ${config.dotClass}`} />
          <span
            className={`text-[12px] font-extrabold tracking-[0.5px] ${config.badgeTextClass}`}
          >
            {config.label}
          </span>
        </div>
      </div>

      <div className="mb-2.5 text-[12.5px] text-[#A89A8B]">
        Para: {post.audience}
      </div>

      <p className="text-[15.5px] leading-[1.55] text-[#4A4038]">{post.body}</p>

      {post.photoLabel ? (
        <a className="mt-3.5 flex h-[200px] flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
          </svg>
          <span className="text-[13.5px]">{post.photoLabel}</span>
        </a>
      ) : null}

      {post.photos && post.photos.length > 0 ? (
        post.photos.length === 1 ? (
          <img
            src={post.photos[0]}
            alt={`Foto de ${post.authorName}`}
            className="mt-3.5 h-[200px] w-full rounded-2xl object-cover"
          />
        ) : (
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            {post.photos.map((photo, index) => (
              <img
                key={photo}
                src={photo}
                alt={`Foto ${index + 1} de ${post.authorName}`}
                className="aspect-square w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        )
      ) : null}

      <div className="mt-4 flex items-center gap-[18px] border-t border-[#F0E6D8] pt-3.5">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-[#E0654A]">
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="#E0654A"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
          {post.hearts}
        </span>
        <a className="flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]">
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
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
          </svg>
          {post.comments}
        </a>
        <span className="flex-1" />
        <a className="text-[14px] font-extrabold text-[#C5503A]">Editar</a>
      </div>
    </article>
  );
}
