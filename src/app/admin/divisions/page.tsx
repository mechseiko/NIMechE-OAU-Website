"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { TechnicalDivision } from "@/types";

const fields: FieldDef[] = [
  { name: "code", label: "Code", type: "text", required: true, half: true, hint: "e.g. THS" },
  { name: "name", label: "Division name", type: "text", required: true, half: true },
  { name: "coordinator", label: "Coordinator", type: "text", half: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "focusAreas", label: "Focus areas", type: "list" },
];

const columns: Column<TechnicalDivision>[] = [
  { key: "code", header: "Code", render: (row) => <span className="font-bold text-primary">{row.code}</span> },
  { key: "name", header: "Division", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
  { key: "coordinator", header: "Coordinator", render: (row) => row.coordinator ?? "—" },
  { key: "focus", header: "Focus areas", render: (row) => row.focusAreas.join(", ") },
];

export default function AdminDivisionsPage() {
  return (
    <CrudManager<TechnicalDivision>
      title="Technical divisions"
      description="The seven engine rooms of the chapter — codes, names and focus areas are editable any time."
      collection={COL.divisions}
      fields={fields}
      columns={columns}
      defaults={{ code: "", name: "", description: "", focusAreas: [], coordinator: "" }}
      prepare={(values, existing) => ({
        ...values,
        slug: existing?.slug || slugify(`${values.code}-${values.name}`),
      })}
      sort={(a, b) => a.code.localeCompare(b.code)}
      emptyTitle="No divisions yet"
      emptyMessage="Run `npm run seed` to create the default seven divisions, or add them manually."
    />
  );
}
