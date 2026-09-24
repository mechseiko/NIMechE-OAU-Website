"use client";

import { CrudManager, PublishedBadge, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { EVENT_TYPE_LABELS, type EventItem } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Event title", type: "text", required: true },
  {
    name: "type",
    label: "Type",
    type: "select",
    required: true,
    half: true,
    options: Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "location", label: "Location", type: "text", half: true },
  { name: "startDate", label: "Starts", type: "datetime", half: true },
  { name: "endDate", label: "Ends", type: "datetime", half: true },
  { name: "registrationUrl", label: "Registration link", type: "text", hint: "External form (Google Form, etc.)" },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "coverUrl", label: "Cover image", type: "image" },
  {
    name: "agenda",
    label: "Schedule / agenda",
    type: "rows",
    subfields: [
      { key: "time", label: "Time / Day" },
      { key: "title", label: "Session title" },
      { key: "detail", label: "Detail (optional)" },
    ],
  },
  {
    name: "speakers",
    label: "Speakers & panelists",
    type: "rows",
    subfields: [
      { key: "name", label: "Name" },
      { key: "title", label: "Title" },
      { key: "organisation", label: "Organisation" },
      { key: "topic", label: "Topic" },
      { key: "photoUrl", label: "Photo URL (optional)" },
    ],
  },
  {
    name: "pitchDecks",
    label: "Student pitch decks",
    type: "rows",
    subfields: [
      { key: "name", label: "Deck name" },
      { key: "url", label: "File URL" },
    ],
  },
  { name: "published", label: "Published", type: "switch" },
];

const columns: Column<EventItem>[] = [
  { key: "title", header: "Event", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "type", header: "Type", render: (row) => EVENT_TYPE_LABELS[row.type] },
  { key: "date", header: "Starts", render: (row) => formatDate(row.startDate) },
  { key: "location", header: "Location", render: (row) => row.location ?? "—" },
  { key: "published", header: "Status", render: (row) => PublishedBadge(row.published) },
];

export default function AdminEventsPage() {
  return (
    <CrudManager<EventItem>
      title="Events, conference & challenge"
      description="Conferences, exhibitions, industrial trips, workshops and Design & Innovation Challenge editions — with agenda, speakers and pitch decks."
      collection={COL.events}
      fields={fields}
      columns={columns}
      defaults={{
        title: "",
        type: "conference",
        description: "",
        location: "",
        startDate: "",
        endDate: "",
        registrationUrl: "",
        coverUrl: "",
        agenda: [],
        speakers: [],
        pitchDecks: [],
        published: false,
      }}
      sort={(a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")}
      emptyTitle="No events yet"
      emptyMessage="Create the annual conference or the next industrial trip here."
    />
  );
}
