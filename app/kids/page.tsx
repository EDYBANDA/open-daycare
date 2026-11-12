import { Sidebar } from "@/app/components/Sidebar";
import { KidsBoard } from "@/app/components/KidsBoard";

export default function KidsPage() {
  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar active="kids" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <KidsBoard />
      </main>
    </div>
  );
}
