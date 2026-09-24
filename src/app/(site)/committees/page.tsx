"use client";

import { Users } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Committee } from "@/types";

export default function CommitteesPage() {
  const { data: committees, loading } = useCollection<Committee>(COL.committees);

  return (
    <>
      <PageHeader
        kicker="Committees"
        title="The standing committees of the chapter"
        description="Permanent and ad-hoc committees that carry the chapter's work — alumni & industry partnership, editorial, welfare, academic activities and more."
      />
      <section className="container-page py-12 md:py-16">
        {loading ? (
          <Spinner />
        ) : committees.length === 0 ? (
          <EmptyState icon={<Users className="h-6 w-6" aria-hidden />} title="No committees published yet" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {committees.map((committee) => (
              <article key={committee.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="font-display text-lg font-bold text-ink">{committee.name}</h2>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                    Standing
                  </span>
                </div>
                <p className="mt-3 text-sm text-ink-soft">{committee.description}</p>
                {committee.chair && (
                  <p className="mt-3 text-sm font-semibold text-secondary">Chair: {committee.chair}</p>
                )}
                {committee.focus.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {committee.focus.map((item) => (
                      <span key={item} className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                {committee.members.length > 0 && (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">Members</p>
                    <p className="mt-1 text-sm text-ink-soft">{committee.members.join(" · ")}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
