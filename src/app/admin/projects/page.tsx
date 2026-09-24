"use client";

import { CrudManager, PublishedBadge, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Project, TechnicalDivision } from "@/types";

export default function AdminProjectsPage() {
  const { data: divisions } = useCollection<TechnicalDivision>(COL.divisions);

  const fields: FieldDef[] = [
    { name: "title", label: "Project title", type: "text", required: true },
    {
      name: "divisionId",
      label: "Technical division",
      type: "select",
      required: true,
      half: true,
      options: divisions.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })),
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      half: true,
      options: [
        { value: "proposed", label: "Proposed" },
        { value: "ongoing", label: "Ongoing" },
        { value: "completed", label: "Completed" },
      ],
    },
    { name: "academicYear", label: "Academic year", type: "text", required: true, hint: "e.g. 2026/2027", half: true },
    { name: "summary", label: "One-line summary", type: "text", required: true },
    { name: "description", label: "Full description", type: "textarea", required: true },
    { name: "teamMembers", label: "Team members", type: "list", hint: "One name per row" },
    { name: "tags", label: "Tags", type: "list", hint: "e.g. EV, Thermal, Fabrication" },
    { name: "coverUrl", label: "Cover image", type: "image" },
    { name: "published", label: "Published", type: "switch" },
  ];

  const columns: Column<Project>[] = [
    { key: "title", header: "Project", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
    {
      key: "division",
      header: "Division",
      render: (row) => divisions.find((d) => d.id === row.divisionId)?.code ?? "—",
    },
    { key: "status", header: "Status", render: (row) => <span className="capitalize">{row.status}</span> },
    { key: "year", header: "Session", render: (row) => row.academicYear },
    { key: "published", header: "Visibility", render: (row) => PublishedBadge(row.published) },
  ];

  return (
    <CrudManager<Project>
      title="Projects & Innovation Hub"
      description="Every chapter project, filterable by division, status and session on the public hub."
      collection={COL.projects}
      fields={fields}
      columns={columns}
      defaults={{
        title: "",
        summary: "",
        description: "",
        divisionId: "",
        status: "ongoing",
        academicYear: "",
        teamMembers: [],
        tags: [],
        coverUrl: "",
        published: false,
      }}
      sort={(a, b) => b.academicYear.localeCompare(a.academicYear)}
      emptyTitle="No projects yet"
      emptyMessage="Add chapter projects so students and sponsors can browse the innovation hub."
    />
  );
}
