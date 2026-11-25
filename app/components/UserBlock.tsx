import { cacheLife } from "next/cache";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

type SidebarUser = {
  fullName: string;
  roleLabel: string;
  initial: string;
};

const roleLabels: Record<string, string> = {
  staff: "Personal",
  parent: "Familia",
  admin: "Admin",
};

const fallbackUser: SidebarUser = {
  fullName: "Usuario",
  roleLabel: "",
  initial: "U",
};

export async function UserBlock() {
  "use cache: private";
  cacheLife({ stale: 300 });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sidebarUser = fallbackUser;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      const fullName = profile.full_name?.trim() || "Usuario";
      sidebarUser = {
        fullName,
        roleLabel: roleLabels[profile.role] ?? "",
        initial: fullName.charAt(0).toUpperCase(),
      };
    }
  }

  return (
    <>
      <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-[#F2937A] font-display text-[16px] font-semibold text-white">
        {sidebarUser.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-extrabold text-[#3F362E]">
          {sidebarUser.fullName}
        </div>
        <div className="text-[12px] text-[#A89A8B]">{sidebarUser.roleLabel}</div>
      </div>
    </>
  );
}

export function UserBlockSkeleton() {
  return (
    <>
      <div className="size-[38px] shrink-0 animate-pulse rounded-full bg-[#F6ECDF]" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 animate-pulse rounded bg-[#F6ECDF]" />
        <div className="h-2.5 w-14 animate-pulse rounded bg-[#F6ECDF]" />
      </div>
    </>
  );
}
