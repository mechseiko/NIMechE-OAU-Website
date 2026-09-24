"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Vote } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input, Select, Switch, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, createDoc, deleteDocAt, updateDocAt } from "@/lib/db";
import { effectiveStatus } from "@/lib/elections";
import { errorMessage, formatDateTime, nowIso, toDateTimeLocal, fromDateTimeLocal } from "@/lib/utils";
import type { Election, ElectionStatus } from "@/types";
import { ELECTION_STATUS_LABELS } from "@/types";

const STATUS_OPTIONS: { value: ElectionStatus; label: string }[] = [
  { value: "draft", label: "Draft — hidden from public" },
  { value: "scheduled", label: "Scheduled — opens automatically at start time" },
  { value: "active", label: "Voting open now" },
  { value: "closed", label: "Closed" },
];

interface FormState {
  title: string;
  academicYear: string;
  description: string;
  status: ElectionStatus;
  startsAt: string;
  endsAt: string;
  requireFeeVerification: boolean;
  liveResults: boolean;
  publishedResults: boolean;
}

const EMPTY: FormState = {
  title: "",
  academicYear: "",
  description: "",
  status: "draft",
  startsAt: "",
  endsAt: "",
  requireFeeVerification: false,
  liveResults: false,
  publishedResults: false,
};

export default function AdminElectionsPage() {
  const { data, loading } = useCollection<Election>(COL.elections);
  const { role } = useAuth();
  const { toast } = useToast();
  const isEditor = role === "editor";

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Election | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Election | null>(null);

  const rows = useMemo(
    () => [...data].sort((a, b) => (a.academicYear < b.academicYear ? 1 : a.academicYear > b.academicYear ? -1 : 0)),
    [data],
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY, academicYear: nextSession() });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(row: Election) {
    setEditing(row);
    setForm({
      title: row.title ?? "",
      academicYear: row.academicYear ?? "",
      description: row.description ?? "",
      status: row.status ?? "draft",
      startsAt: row.startsAt ?? "",
      endsAt: row.endsAt ?? "",
      requireFeeVerification: Boolean(row.requireFeeVerification),
      liveResults: Boolean(row.liveResults),
      publishedResults: Boolean(row.publishedResults),
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Election title is required";
    if (!form.academicYear.trim()) next.academicYear = "Academic year / session is required";
    if (form.status === "scheduled" && !form.startsAt) next.startsAt = "Set a start time for a scheduled election";
    if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt))
      next.endsAt = "End time must be after the start time";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        academicYear: form.academicYear.trim(),
        description: form.description.trim(),
        status: form.status,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
        requireFeeVerification: form.requireFeeVerification,
        liveResults: form.liveResults,
        publishedResults: form.publishedResults,
      };
      if (editing) {
        await updateDocAt(COL.elections, editing.id, payload);
        toast("Election updated.");
      } else {
        await createDoc(COL.elections, { ...payload, createdAt: nowIso() } as never);
        toast("Election created. Open it to add positions and candidates.");
      }
      setModalOpen(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteDocAt(COL.elections, deleting.id);
      toast("Election deleted.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setDeleting(null);
    }
  }

  const columns: Column<Election>[] = [
    {
      key: "title",
      header: "Election",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{row.title}</p>
          <p className="text-xs text-ink-muted">Session {row.academicYear}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const eff = effectiveStatus(row);
        return <Badge tone={statusTone(eff)}>{ELECTION_STATUS_LABELS[eff]}</Badge>;
      },
    },
    {
      key: "window",
      header: "Voting window",
      className: "hidden md:table-cell",
      render: (row) =>
        row.startsAt || row.endsAt ? (
          <span className="text-xs text-ink-muted">
            {row.startsAt ? formatDateTime(row.startsAt) : "—"} → {row.endsAt ? formatDateTime(row.endsAt) : "—"}
          </span>
        ) : (
          <span className="text-xs text-ink-muted">Manual</span>
        ),
    },
    {
      key: "manage",
      header: "",
      render: (row) => (
        <Link
          href={`/admin/elections/${row.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft"
        >
          Manage <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Elections</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Create one election per session, then open it to add positions, candidates and control the voting
            window. Scheduled elections open and close automatically — set next year&rsquo;s now and it runs itself.
          </p>
        </div>
        {!isEditor && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" aria-hidden /> New election
          </Button>
        )}
      </header>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="No elections yet"
        emptyMessage="Create this session's election to begin adding positions and candidates."
        emptyAction={
          !isEditor ? (
            <Button onClick={openCreate}>
              <Vote className="h-4 w-4" aria-hidden /> Create election
            </Button>
          ) : undefined
        }
        onEdit={isEditor ? undefined : openEdit}
        onDelete={isEditor ? undefined : (row) => setDeleting(row)}
        rowKey={(row) => row.id}
      />

      {isEditor && (
        <p className="rounded-lg bg-accent-soft px-4 py-2 text-xs font-semibold text-accent-dark">
          Editor role: elections are managed by Administrators only.
        </p>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit election" : "New election"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving}>
              {editing ? "Save changes" : "Create election"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Election title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              error={errors.title}
              placeholder="e.g. NIMechE OAU-SC Executive Elections"
            />
          </div>
          <Input
            label="Session / academic year"
            required
            value={form.academicYear}
            onChange={(e) => set("academicYear", e.target.value)}
            error={errors.academicYear}
            hint="e.g. 2026/2027 — used to archive past elections"
          />
          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => set("status", e.target.value as ElectionStatus)}
            hint="Scheduled elections open/close automatically from the window below."
          />
          <Input
            label="Voting opens"
            type="datetime-local"
            value={toDateTimeLocal(form.startsAt)}
            onChange={(e) => set("startsAt", fromDateTimeLocal(e.target.value) ?? "")}
            error={errors.startsAt}
          />
          <Input
            label="Voting closes"
            type="datetime-local"
            value={toDateTimeLocal(form.endsAt)}
            onChange={(e) => set("endsAt", fromDateTimeLocal(e.target.value) ?? "")}
            error={errors.endsAt}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description / instructions (optional)"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Shown on the public elections page."
            />
          </div>
          <div className="sm:col-span-2 grid gap-3 rounded-xl border border-line bg-surface-subtle p-4">
            <Switch
              id="el-fee"
              label="Require fee verification to vote"
              description="Only members whose departmental dues are marked paid for this session may ballot."
              checked={form.requireFeeVerification}
              onChange={(v) => set("requireFeeVerification", v)}
            />
            <Switch
              id="el-live"
              label="Show live results while voting is open"
              description="Displays a running tally to voters before the election closes."
              checked={form.liveResults}
              onChange={(v) => set("liveResults", v)}
            />
            <Switch
              id="el-published"
              label="Publish final results"
              description="Makes results permanently visible on the public site, even before the window formally closes."
              checked={form.publishedResults}
              onChange={(v) => set("publishedResults", v)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete election"
        message={`This permanently removes “${deleting?.title ?? ""}”, its positions, candidates and any recorded votes. This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/** Suggest the next academic session, e.g. 2026/2027. */
function nextSession(): string {
  const year = new Date().getFullYear();
  return `${year}/${year + 1}`;
}
