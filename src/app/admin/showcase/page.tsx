"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { SHOWCASE_LABELS, type ShowcaseItem } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true, half: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(SHOWCASE_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "imageUrl", label: "Photo", type: "image" },
];

const columns: Column<ShowcaseItem>[] = [
  { key: "title", header: "Item", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => SHOWCASE_LABELS[row.category] },
];

export default function AdminShowcasePage() {
  return (
    <CrudManager<ShowcaseItem>
      title="Department showcase"
      description="Facilities, laboratories, culture and programmes of the Department of Mechanical Engineering."
      collection={COL.showcase}
      fields={fields}
      columns={columns}
      defaults={{ title: "", description: "", category: "facility", imageUrl: "" }}
      sort={(a, b) => a.category.localeCompare(b.category)}
      emptyTitle="Showcase is empty"
    />
  );
}
