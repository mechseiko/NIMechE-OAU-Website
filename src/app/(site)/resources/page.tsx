"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { RESOURCE_LABELS, type ResourceItem } from "@/types";

export default function ResourcesPage() {
  const { data: resources, loading } = useCollection<ResourceItem>(COL.resources);
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const list = category === "all" ? resources : resources.filter((r) => r.category === category);
    return [...list].filter((r) => r.published).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [resources, category]);

  return (
    <>
      <PageHeader
        kicker="Resource center"
        title="Handouts, guides, forms & training material"
        description="Categorized downloads maintained by the Librarian — including the chapter constitution and past questions."
      />
      <section className="container-page py-12 md:py-16">
        <Tabs
          className="mb-8 max-w-4xl"
          active={category}
          onChange={setCategory}
          items={[
            { id: "all", label: "All", count: resources.filter((r) => r.published).length },
            ...Object.entries(RESOURCE_LABELS).map(([id, label]) => ({
              id,
              label,
              count: resources.filter((r) => r.published && r.category === id).length,
            })),
          ]}
        />
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<FileText className="h-6 w-6" aria-hidden />} title="No resources in this category" message="Uploads from the council will appear here." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {filtered.map((resource) => {
              const href = resource.fileUrl ?? resource.externalUrl;
              return (
                <li key={resource.id}>
                  <article className="card flex items-start gap-4 p-5 transition-shadow hover:shadow-lift">
                    <span className="rounded-xl bg-primary-soft p-3 text-primary">
                      <FileText className="h-6 w-6" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-base font-bold text-ink">{resource.title}</h2>
                        <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                          {RESOURCE_LABELS[resource.category]}
                        </span>
                      </div>
                      {resource.description && <p className="mt-1 text-sm text-ink-muted">{resource.description}</p>}
                      <p className="mt-2 text-xs text-ink-muted">
                        {resource.meta ? `${resource.meta} · ` : ""}Added {formatDate(resource.createdAt)}
                      </p>
                    </div>
                    {href && (
                      <a
                        href={href}
                        target={resource.externalUrl ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        download={resource.fileUrl ? true : undefined}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary-dark"
                        aria-label={`Download ${resource.title}`}
                      >
                        {resource.fileUrl ? <Download className="h-4 w-4" aria-hidden /> : <ExternalLink className="h-4 w-4" aria-hidden />}
                        {resource.fileUrl ? "Download" : "Open"}
                      </a>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
