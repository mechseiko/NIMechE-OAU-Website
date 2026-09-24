"use client";

import { useMemo, useRef, useState } from "react";
import { Search, Upload, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/context/ToastProvider";
import { useAuth } from "@/context/AuthProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, deleteDocAt, setDocAt, updateDocAt } from "@/lib/db";
import { currentAcademicYear, errorMessage, formatDateTime, nowIso } from "@/lib/utils";
import { FEE_STATUS_LABELS, type FeeRecord, type FeeStatus } from "@/types";
import { feeDocId } from "@/lib/elections";

export default function AdminFeesPage() {
  const { data, loading } = useCollection<FeeRecord>(COL.fees);
  const { profile } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeeRecord | null>(null);
  const [form, setForm] = useState({ matricNumber: "", fullName: "", academicYear: currentAcademicYear(), status: "paid" as FeeStatus, amount: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<FeeRecord | null>(null);

  const years = useMemo(() => [...new Set(data.map((f) => f.academicYear))].sort().reverse(), [data]);

  const rows = useMemo(
    () =>
      [...data]
        .filter((f) => (year === "all" ? true : f.academicYear === year))
        .filter((f) => `${f.matricNumber} ${f.fullName}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.matricNumber.localeCompare(b.matricNumber)),
    [data, search, year],
  );

  function openCreate() {
    setEditing(null);
    setForm({ matricNumber: "", fullName: "", academicYear: currentAcademicYear(), status: "paid", amount: "", note: "" });
    setModalOpen(true);
  }

  function openEdit(row: FeeRecord) {
    setEditing(row);
    setForm({
      matricNumber: row.matricNumber,
      fullName: row.fullName,
      academicYear: row.academicYear,
      status: row.status,
      amount: row.amount ?? "",
      note: row.note ?? "",
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.matricNumber.trim() || !form.fullName.trim()) {
      toast("Matric number and full name are required.", "error");
      return;
    }
    setSaving(true);
    try {
      const id = feeDocId(form.matricNumber, form.academicYear);
      const payload = {
        matricNumber: form.matricNumber.trim().toUpperCase(),
        fullName: form.fullName.trim(),
        academicYear: form.academicYear.trim(),
        status: form.status,
        amount: form.amount || undefined,
        note: form.note || undefined,
        verifiedBy: profile?.displayName ?? "Admin",
        verifiedAt: nowIso(),
      };
      if (editing) await updateDocAt(COL.fees, editing.id, payload);
      else await setDocAt(COL.fees, id, payload);
      toast(editing ? "Fee record updated." : "Fee record verified.");
      setModalOpen(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  /** Bulk import: CSV rows of matricNumber,fullName[,status] */
  async function importCsv(file: File) {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    let imported = 0;
    let skipped = 0;
    try {
      for (const line of lines) {
        const [matric, fullName, status] = line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
        if (!matric || !fullName || matric.toLowerCase() === "matricnumber") {
          skipped++;
          continue;
        }
        const record: FeeRecord = {
          id: feeDocId(matric, currentAcademicYear()),
          matricNumber: matric.toUpperCase(),
          fullName,
          academicYear: currentAcademicYear(),
          status: (status as FeeStatus) || "paid",
          verifiedBy: profile?.displayName ?? "Admin",
          verifiedAt: nowIso(),
        };
        await setDocAt(COL.fees, record.id, { ...record });
        imported++;
      }
      toast(`Imported ${imported} record${imported === 1 ? "" : "s"}${skipped ? `, skipped ${skipped}` : ""} for ${currentAcademicYear()}.`);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  const columns: Column<FeeRecord>[] = [
    { key: "matric", header: "Matric No.", render: (row) => <span className="font-mono text-xs font-semibold text-ink">{row.matricNumber}</span> },
    { key: "name", header: "Full name", render: (row) => <span className="font-semibold text-ink">{row.fullName}</span> },
    { key: "year", header: "Session", render: (row) => row.academicYear },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge tone={row.status === "paid" ? "success" : row.status === "pending" ? "accent" : "danger"}>
          {FEE_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    { key: "verified", header: "Verified", render: (row) => (row.verifiedAt ? `${row.verifiedBy} · ${formatDateTime(row.verifiedAt)}` : "—") },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Fee verification</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Manual, admin-driven dues register keyed by matric number. Elections can gate voting on a “paid” record for the session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            aria-label="Import fee list CSV"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importCsv(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" aria-hidden /> Bulk import CSV
          </Button>
          <Button onClick={openCreate}>
            <Wallet className="h-4 w-4" aria-hidden /> Add record
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
          <Input aria-label="Search by matric number or name" placeholder="Search matric no. or name…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-72 pl-9" />
        </div>
        <Select
          aria-label="Filter by session"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-48"
          options={[{ value: "all", label: "All sessions" }, ...years.map((y) => ({ value: y, label: y }))]}
        />
        <p className="self-center text-sm text-ink-muted" role="status">{rows.length} record{rows.length === 1 ? "" : "s"}</p>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        emptyTitle="No fee records yet"
        emptyMessage="Add records one-by-one or bulk import a CSV of matricNumber,fullName,status."
        onEdit={openEdit}
        onDelete={(row) => setDeleting(row)}
        rowKey={(row) => row.id}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit fee record" : "Verify departmental dues"}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing ? "Save" : "Verify"}</Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Input label="Matric number" required value={form.matricNumber} onChange={(e) => setForm({ ...form, matricNumber: e.target.value })} placeholder="EGD/21/1234" />
          <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Academic year" required value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as FeeStatus })}
            options={Object.entries(FEE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Input label="Amount (optional)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="₦5,000" />
          <Input label="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete fee record"
        message="The member will lose their verified dues status for this session."
        onConfirm={async () => {
          if (!deleting) return;
          await deleteDocAt(COL.fees, deleting.id);
          setDeleting(null);
          toast("Record deleted.");
        }}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
