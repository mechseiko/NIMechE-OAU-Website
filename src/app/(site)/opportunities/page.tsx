"use client";

import { useMemo, useState } from "react";
import { Briefcase, ExternalLink } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { daysUntil, formatDate } from "@/lib/utils";
import { OPPORTUNITY_LABELS, type Opportunity } from "@/types";

export default function OpportunitiesPage() {
  const { data: opportunities, loading } = useCollection<Opportunity>(COL.opportunities);
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const list = category === "all" ? opportunities : opportunities.filter((o) => o.category === category);
    return [...list]
      .filter((o) => o.published)
      .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));
  }, [opportunities, category]);

  return (
    <>
      <PageHeader
        kicker="Opportunities portal"
        title="SIWES, scholarships, competitions & openings"
        description="Curated opportunities for mechanical engineering students — filtered by category and sorted by deadline."
      />
      <section className="container-page py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-64"
            options={[
              { value: "all", label: "All categories" },
              ...Object.entries(OPPORTUNITY_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
          <p className="text-sm text-ink-muted" role="status">
            {filtered.length} opportunit{filtered.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="h-6 w-6" aria-hidden />}
            title="No opportunities in this category"
            message="New internships, scholarships and openings are posted as they reach the council."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((opportunity) => {
              const days = daysUntil(opportunity.deadline);
              return (
                <ListingCard
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.id}`}
                  title={opportunity.title}
                  description={opportunity.description}
                  badge={OPPORTUNITY_LABELS[opportunity.category]}
                  badgeTone="secondary"
                  meta={[
                    opportunity.organisation,
                    opportunity.deadline ? `Closes ${formatDate(opportunity.deadline)}` : "Open roll",
                  ]}
                  footer={
                    days !== null && days >= 0 ? (
                      <span className="mt-2 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold text-accent-dark">
                        {days === 0 ? "Closes today" : `${days} day${days === 1 ? "" : "s"} left`}
                      </span>
                    ) : days !== null ? (
                      <span className="mt-2 inline-flex rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-bold text-danger">
                        Deadline passed
                      </span>
                    ) : null
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
