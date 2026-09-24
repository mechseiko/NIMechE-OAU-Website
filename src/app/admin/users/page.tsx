"use client";

import { useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, updateDocRaw } from "@/lib/db";
import { errorMessage, formatDate, initials } from "@/lib/utils";
import type { Role, UserProfile } from "@/types";
import { ROLE_LABELS } from "@/types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "super_admin", label: ROLE_LABELS.super_admin },
  { value: "admin", label: ROLE_LABELS.admin },
  { value: "editor", label: ROLE_LABELS.editor },
  { value: "member", label: ROLE_LABELS.member },
];

export default function AdminUsersPage() {
  const { data, loading } = useCollection<UserProfile>(COL.users);
  const { profile, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [savingUid, setSavingUid] = useState<string | null>(null);

  const superAdminCount = useMemo(() => data.filter((u) => u.role === "super_admin").length, [data]);
  const rows = useMemo(
    () =>
      [...data].sort((a, b) => {
        const rank: Record<Role, number> = { super_admin: 0, admin: 1, editor: 2, member: 3 };
        return rank[a.role] - rank[b.role] || a.displayName.localeCompare(b.displayName);
      }),
    [data],
  );

  async function changeRole(user: UserProfile, nextRole: Role) {
    if (user.uid === profile?.uid) {
      toast("You cannot change your own role.", "error");
      return;
    }
    if (user.role === "super_admin" && nextRole !== "super_admin" && superAdminCount <= 1) {
      toast("At least one Super Admin must remain.", "error");
      return;
    }
    setSavingUid(user.uid);
    try {
      await updateDocRaw(COL.users, user.uid, { role: nextRole });
      toast(`${user.displayName} is now ${ROLE_LABELS[nextRole]}.`);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSavingUid(null);
    }
  }

  if (!isSuperAdmin) {
    return (
      <EmptyState
        title="Super Admin only"
        message="Only a Super Admin can manage user roles and permissions."
      />
    );
  }

  const columns: Column<UserProfile>[] = [
    {
      key: "name",
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {initials(row.displayName || row.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">
              {row.displayName || "Unnamed"}
              {row.uid === profile?.uid && <span className="ml-1 text-xs font-normal text-ink-muted">(you)</span>}
            </p>
            <p className="truncate text-xs text-ink-muted">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "matric",
      header: "Matric / Level",
      className: "hidden md:table-cell",
      render: (row) => (
        <span className="text-xs text-ink-muted">
          {[row.matricNumber, row.level].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      className: "hidden lg:table-cell",
      render: (row) => <span className="text-xs text-ink-muted">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (row) => {
        const isSelf = row.uid === profile?.uid;
        return (
          <div className="flex items-center gap-2">
            {row.role === "super_admin" && <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" aria-hidden />}
            <Select
              aria-label={`Role for ${row.displayName || row.email}`}
              options={ROLE_OPTIONS}
              value={row.role}
              disabled={isSelf || savingUid === row.uid}
              onChange={(e) => void changeRole(row, e.target.value as Role)}
              className="min-w-[150px]"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Users &amp; roles</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          Promote trusted members to Administrator or Super Admin, or limit contributors to Editor (draft-only). The
          first account ever registered becomes Super Admin automatically.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["super_admin", "admin", "editor", "member"] as Role[]).map((r) => (
          <Badge key={r} tone={r === "super_admin" ? "secondary" : "neutral"}>
            {ROLE_LABELS[r]}: {data.filter((u) => u.role === r).length}
          </Badge>
        ))}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="No users yet"
        emptyMessage="Registered members will appear here."
        rowKey={(row) => row.uid}
      />
    </div>
  );
}
