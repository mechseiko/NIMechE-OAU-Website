"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { GALLERY_LABELS, type GalleryItem } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Title", type: "text", required: true, half: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(GALLERY_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "imageUrl", label: "Photo", type: "image", required: true },
  { name: "alt", label: "Alt text", type: "text", required: true, hint: "Required for screen-reader accessibility" },
  { name: "takenAt", label: "Date taken", type: "datetime", half: true },
  { name: "description", label: "Caption (optional)", type: "textarea" },
];

const columns: Column<GalleryItem>[] = [
  {
    key: "image",
    header: "Photo",
    render: (row) =>
      // eslint-disable-next-line @next/next/no-img-element
      <img src={row.imageUrl} alt={row.alt} className="h-12 w-16 rounded-lg object-cover" />,
  },
  { key: "title", header: "Title", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => GALLERY_LABELS[row.category] },
  { key: "takenAt", header: "Taken", render: (row) => formatDate(row.takenAt) },
];

export default function AdminGalleryPage() {
  return (
    <CrudManager<GalleryItem>
      title="Gallery & media"
      description="Photos across events, industry visits, projects, department life and achievements."
      collection={COL.gallery}
      fields={fields}
      columns={columns}
      defaults={{ title: "", imageUrl: "", alt: "", category: "event", takenAt: "", description: "" }}
      sort={(a, b) => (b.takenAt ?? "").localeCompare(a.takenAt ?? "")}
      emptyTitle="Gallery is empty"
      emptyMessage="Upload chapter photos — they flow into the gallery, department showcase and industry pages."
    />
  );
}
