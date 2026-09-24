"use client";

import { CrudManager, PublishedBadge, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { RESOURCE_LABELS, type ResourceItem } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(RESOURCE_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "meta", label: "Meta (size / pages)", type: "text", half: true, hint: "e.g. PDF · 2.1 MB" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "fileUrl", label: "File", type: "text", hint: "Paste a Cloudinary/Drive URL — or upload via Gallery-style flow" },
  { name: "externalUrl", label: "External link (alternative)", type: "text" },
  { name: "published", label: "Published", type: "switch" },
];

const columns: Column<ResourceItem>[] = [
  { key: "title", header: "Resource", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => RESOURCE_LABELS[row.category] },
  { key: "date", header: "Added", render: (row) => formatDate(row.createdAt) },
  { key: "published", header: "Status", render: (row) => PublishedBadge(row.published) },
];

export default function AdminResourcesPage() {
  return (
    <CrudManager<ResourceItem>
      title="Resource center"
      description="Handouts, guides, training videos, the constitution, past questions and forms."
      collection={COL.resources}
      fields={fields}
      columns={columns}
      defaults={{ title: "", category: "handout", description: "", fileUrl: "", externalUrl: "", meta: "", published: false }}
      sort={(a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")}
      emptyTitle="No resources yet"
      emptyMessage="Upload the constitution, handouts and forms for members."
    />
  );
}
