"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import type { Committee } from "@/types";

const fields: FieldDef[] = [
  { name: "name", label: "Committee name", type: "text", required: true },
  { name: "chair", label: "Chairperson", type: "text", half: true },
  { name: "description", label: "Mandate / description", type: "textarea", required: true },
  { name: "focus", label: "Focus areas", type: "list" },
  { name: "members", label: "Members", type: "list" },
];

const columns: Column<Committee>[] = [
  { key: "name", header: "Committee", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
  { key: "chair", header: "Chair", render: (row) => row.chair ?? "—" },
  { key: "members", header: "Members", render: (row) => row.members.length },
];

export default function AdminCommitteesPage() {
  return (
    <CrudManager<Committee>
      title="Committees"
      description="Standing and ad-hoc committees — alumni & industry partnership, editorial, welfare, academic activities."
      collection={COL.committees}
      fields={fields}
      columns={columns}
      defaults={{ name: "", description: "", chair: "", focus: [], members: [] }}
      sort={(a, b) => a.name.localeCompare(b.name)}
      emptyTitle="No committees yet"
    />
  );
}
