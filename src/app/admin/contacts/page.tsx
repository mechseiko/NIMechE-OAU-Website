"use client";

import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, deleteDocAt, updateDocRaw } from "@/lib/db";
import { errorMessage, formatDateTime } from "@/lib/utils";
import type { ContactSubmission } from "@/types";

export default function AdminContactsPage() {
  const { data, loading } = useCollection<ContactSubmission>(COL.contacts);
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContactSubmission | null>(null);

  const rows = useMemo(
    () => [...data].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [data],
  );

  async function markRead(row: ContactSubmission) {
    try {
      await updateDocRaw(COL.contacts, row.id, { read: true });
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function markAllRead() {
    try {
      for (const row of rows.filter((r) => !r.read)) {
        await updateDocRaw(COL.contacts, row.id, { read: true });
      }
      toast("Inbox marked as read.");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  const columns: Column<ContactSubmission>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (row) => (
        <button type="button" onClick={() => { setExpanded(expanded === row.id ? null : row.id); void markRead(row); }} className="text-left font-semibold text-ink hover:text-primary">
          {row.subject}
          {!row.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-secondary" aria-label="unread" />}
        </button>
      ),
    },
    { key: "from", header: "From", render: (row) => `${row.name} · ${row.email}` },
    { key: "type", header: "Type", render: (row) => <Badge tone="neutral">{row.type}</Badge> },
    { key: "date", header: "Received", render: (row) => formatDateTime(row.createdAt) },
  ];

  const expandedRow = rows.find((r) => r.id === expanded);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>
          <p className="mt-1 text-sm text-ink-muted">Contact-form submissions from visitors, alumni and industry.</p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={rows.every((r) => r.read)}>
          <CheckCheck className="h-4 w-4" aria-hidden /> Mark all read
        </Button>
      </header>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="Inbox zero"
        emptyMessage="Messages from the public contact form land here."
        onDelete={(row) => setDeleting(row)}
        rowKey={(row) => row.id}
      />

      {expandedRow && (
        <article className="card p-6" aria-label={`Message: ${expandedRow.subject}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-ink">{expandedRow.subject}</h2>
            <Badge tone="neutral">{expandedRow.type}</Badge>
          </div>
          <p className="text-sm text-ink-muted">
            {expandedRow.name} · <a className="text-primary hover:underline" href={`mailto:${expandedRow.email}`}>{expandedRow.email}</a> · {formatDateTime(expandedRow.createdAt)}
          </p>
          <p className="prose-body mt-4 text-sm text-ink-soft">{expandedRow.message}</p>
          <a href={`mailto:${expandedRow.email}?subject=Re: ${encodeURIComponent(expandedRow.subject)}`} className="mt-4 inline-block">
            <Button size="sm">Reply by email</Button>
          </a>
        </article>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete message"
        message="This permanently deletes the submission."
        onConfirm={async () => {
          if (!deleting) return;
          await deleteDocAt(COL.contacts, deleting.id);
          setDeleting(null);
          toast("Message deleted.");
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
