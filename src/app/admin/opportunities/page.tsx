"use client";

import { CrudManager, PublishedBadge, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { OPPORTUNITY_LABELS, type Opportunity } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(OPPORTUNITY_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "organisation", label: "Organisation", type: "text", required: true, half: true },
  { name: "deadline", label: "Deadline", type: "datetime", half: true },
  { name: "location", label: "Location", type: "text", half: true },
  { name: "url", label: "Application link", type: "text" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "published", label: "Published", type: "switch" },
];

const columns: Column<Opportunity>[] = [
  { key: "title", header: "Opportunity", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => OPPORTUNITY_LABELS[row.category] },
  { key: "organisation", header: "Organisation", render: (row) => row.organisation },
  { key: "deadline", header: "Deadline", render: (row) => formatDate(row.deadline) },
  { key: "published", header: "Status", render: (row) => PublishedBadge(row.published) },
];

export default function AdminOpportunitiesPage() {
  return (
    <CrudManager<Opportunity>
      title="Opportunities portal"
      description="SIWES placements, scholarships, competitions, trainings and graduate openings."
      collection={COL.opportunities}
      fields={fields}
      columns={columns}
      defaults={{ title: "", category: "siwes", organisation: "", description: "", deadline: "", url: "", location: "", published: false }}
      sort={(a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999")}
      emptyTitle="No opportunities yet"
      emptyMessage="Post the first internship or scholarship for members."
    />
  );
}
