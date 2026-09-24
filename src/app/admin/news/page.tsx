"use client";

import { CrudManager, PublishedBadge, type FieldDef } from "@/components/admin/CrudManager";
import type { Column } from "@/components/ui/DataTable";
import { COL } from "@/lib/db";
import { formatDate, slugify } from "@/lib/utils";
import type { NewsPost } from "@/types";

const fields: FieldDef[] = [
  { name: "title", label: "Headline", type: "text", required: true },
  { name: "category", label: "Category", type: "text", required: true, hint: "e.g. Communiqué, Event, Result", half: true },
  { name: "author", label: "Author", type: "text", required: true, hint: "e.g. General Secretary", half: true },
  { name: "excerpt", label: "Summary", type: "textarea", required: true },
  { name: "body", label: "Article body", type: "textarea", required: true },
  { name: "coverUrl", label: "Cover image", type: "image" },
  { name: "published", label: "Published", type: "switch", hint: "Drafts stay hidden from the public site" },
];

const columns: Column<NewsPost>[] = [
  { key: "title", header: "Headline", render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
  { key: "category", header: "Category", render: (row) => row.category },
  { key: "author", header: "Author", render: (row) => row.author },
  { key: "date", header: "Created", render: (row) => formatDate(row.createdAt) },
  { key: "published", header: "Status", render: (row) => PublishedBadge(row.published) },
];

export default function AdminNewsPage() {
  return (
    <CrudManager<NewsPost>
      title="News & announcements"
      description="Publish communiqués and stories to the newsroom."
      collection={COL.news}
      fields={fields}
      columns={columns}
      defaults={{ title: "", category: "", author: "", excerpt: "", body: "", coverUrl: "", published: false }}
      prepare={(values, existing) => ({
        ...values,
        slug: existing?.slug || slugify(values.title as string),
        updatedAt: new Date().toISOString(),
      })}
      sort={(a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")}
      emptyTitle="No articles yet"
      emptyMessage="Publish the first announcement to see it on the homepage newsroom."
    />
  );
}
