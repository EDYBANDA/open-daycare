import { Sidebar } from "@/app/components/Sidebar";
import { FeedHeader } from "@/app/components/FeedHeader";
import { QuickCreateCard } from "@/app/components/QuickCreateCard";
import { PostCard } from "@/app/components/PostCard";
import { feedPosts } from "@/app/data/feed";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar active="feed" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <FeedHeader />
          <QuickCreateCard />
          <div className="mb-3.5 flex items-center gap-[14px]">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
              PUBLICADO HOY
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>
          <div className="flex flex-col gap-4">
            {feedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
