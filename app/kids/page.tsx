import { Suspense } from "react";

import { Sidebar } from "@/app/components/Sidebar";
import { KidsBoard } from "@/app/components/KidsBoard";
import { UserBlock, UserBlockSkeleton } from "@/app/components/UserBlock";

export default function KidsPage() {
  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar active="kids">
        <Suspense fallback={<UserBlockSkeleton />}>
          <UserBlock />
        </Suspense>
      </Sidebar>
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <KidsBoard />
      </main>
    </div>
  );
}
