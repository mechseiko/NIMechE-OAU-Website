"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { ACHIEVEMENT_LABELS, type Achievement } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(ACHIEVEMENT_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "year", label: "Year", type: "text", required: true, half: true, hint: "e.g. 2026" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "people", label: "Members / team", type: "list" },
  { name: "imageUrl", label: "Photo", type: "image" },
];

const columns: Column<Achievement>[] = [
  { key: "title", header: "Achievement", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => ACHIEVEMENT_LABELS[row.category] },
  { key: "year", header: "Year", render: (row) => row.year },
  { key: "people", header: "People", render: (row) => row.people.join(", ") || "—" },
];

export default function AdminAchievementsPage() {
  return (
    <CrudManager<Achievement>
      title="Achievements"
      description="Competition wins, awards, research milestones and ventures — the chapter's hall of fame."
      collection={COL.achievements}
      fields={fields}
      columns={columns}
      defaults={{ title: "", description: "", year: "", category: "competition", people: [], imageUrl: "" }}
      sort={(a, b) => b.year.localeCompare(a.year)}
      emptyTitle="No achievements recorded yet"
    />
  );
}
