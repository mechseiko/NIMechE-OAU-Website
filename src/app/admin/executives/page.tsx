"use client";

import { CrudManager, type FieldDef } from "@/components/admin/CrudManager";
import { Badge } from "@/components/ui/Badge";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import type { Executive } from "@/types";

const fields: FieldDef[] = [
  { name: "name", label: "Full name", type: "text", required: true, half: true },
  { name: "position", label: "Position", type: "text", required: true, half: true, hint: "e.g. President" },
  { name: "administration", label: "Administration", type: "text", required: true, half: true, hint: "e.g. 2026/2027" },
  { name: "order", label: "Display order", type: "number", half: true },
  { name: "email", label: "Email", type: "text", half: true },
  { name: "phone", label: "Phone", type: "text", half: true },
  { name: "photoUrl", label: "Portrait", type: "image" },
  { name: "message", label: "Quote / message (optional)", type: "textarea" },
  { name: "current", label: "Current office holder", type: "switch", hint: "Off = archived under past administrations" },
];

const columns: Column<Executive>[] = [
  { key: "name", header: "Name", render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
  { key: "position", header: "Position", render: (row) => row.position },
  { key: "administration", header: "Administration", render: (row) => row.administration },
  {
    key: "current",
    header: "Status",
    render: (row) => (row.current ? <Badge tone="success">In office</Badge> : <Badge tone="neutral">Archived</Badge>),
  },
];

export default function AdminExecutivesPage() {
  return (
    <CrudManager<Executive>
      title="Executive council"
      description="Current officers and the full past-administrations archive. Uncheck “current” at handover to archive a council."
      collection={COL.executives}
      fields={fields}
      columns={columns}
      defaults={{ name: "", position: "", administration: "", email: "", phone: "", photoUrl: "", order: 0, current: true, message: "" }}
      sort={(a, b) => Number(b.current) - Number(a.current) || a.order - b.order}
      emptyTitle="No executives yet"
      emptyMessage="Add the current executive council — profiles appear on the public site instantly."
    />
  );
}
