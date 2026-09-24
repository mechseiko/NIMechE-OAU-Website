"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import type { AlumniProfile } from "@/types";

export default function AdminAlumniPage() {
  const { data, loading } = useCollection<AlumniProfile>(COL.alumni);
  const [search, setSearch] = useState("");

  const rows = useMemo(
    () =>
      [...data]
        .filter((a) => `${a.fullName} ${a.email} ${a.company ?? ""}`.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [data, search],
  );

  function exportCsv() {
    const header = ["Full name", "Email", "Phone", "Matric", "Grad year", "Role", "Company", "Location", "Registered"];
    const lines = rows.map((row) =>
      [row.fullName, row.email, row.phone ?? "", row.matricNumber ?? "", row.graduationYear ?? "", row.currentRole ?? "", row.company ?? "", row.location ?? "", row.createdAt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `nimeche-alumni-roll-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const columns: Column<AlumniProfile>[] = [
    { key: "name", header: "Name", render: (row) => <span className="font-semibold text-ink">{row.fullName}</span> },
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "grad", header: "Grad year", render: (row) => row.graduationYear ?? "—" },
    { key: "role", header: "Current role", render: (row) => [row.currentRole, row.company].filter(Boolean).join(" @ ") || "—" },
    { key: "date", header: "Registered", render: (row) => formatDateTime(row.createdAt) },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Alumni sign-ups</h1>
          <p className="mt-1 text-sm text-ink-muted">The alumni roll from the public registration form.</p>
        </div>
        <div className="flex gap-2">
          <Input aria-label="Search alumni" placeholder="Search name, email, company…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" aria-hidden /> Export CSV
          </Button>
        </div>
      </header>
      <DataTable rows={rows} columns={columns} loading={loading} emptyTitle="No alumni registered yet" emptyMessage="Public registrations from /alumni appear here." rowKey={(row) => row.id} />
    </div>
  );
}
