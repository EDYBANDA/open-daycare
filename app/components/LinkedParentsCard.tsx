"use client";

import { useSyncExternalStore } from "react";
import { LinkParentModal } from "@/app/components/LinkParentModal";
import type { LinkedParent } from "@/app/data/kids";
import {
  buildParentFromInvite,
  loadStoredInvites,
  saveStoredInvites,
  subscribeToInvites,
  type ParentInvite,
} from "@/app/lib/parent-invites";

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

const EMPTY_INVITES: ParentInvite[] = [];

export function LinkedParentsCard({
  kidId,
  kidName,
  parents,
}: {
  kidId: string;
  kidName: string;
  parents: LinkedParent[];
}) {
  const storedInvites = useSyncExternalStore(
    subscribeToInvites,
    loadStoredInvites,
    () => EMPTY_INVITES,
  );

  const kidInvites = storedInvites.filter((invite) => invite.kidId === kidId);

  const rows = [
    ...parents.map((parent) => ({ key: parent.name, parent })),
    ...kidInvites.map((invite, index) => ({
      key: invite.id,
      parent: buildParentFromInvite(invite, parents.length + index),
    })),
  ];

  const handleSend = (invite: ParentInvite) => {
    saveStoredInvites([...storedInvites, invite]);
  };

  return (
    <div className="rounded-2xl border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-4">
      <div className="mb-3.5 text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
        PADRES VINCULADOS
      </div>
      <div className="flex flex-col gap-3.5">
        {rows.map(({ key, parent }) => {
          const status = statusConfig[parent.status];
          return (
            <div key={key} className="flex items-center gap-3">
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
        <LinkParentModal kidId={kidId} kidName={kidName} onSend={handleSend} />
      </div>
    </div>
  );
}
