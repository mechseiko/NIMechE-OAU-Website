"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { daysUntil, formatDate } from "@/lib/utils";
import { OPPORTUNITY_LABELS, type Opportunity } from "@/types";

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: opportunity, loading } = useDoc<Opportunity>(COL.opportunities, id);

  if (loading) return <Spinner label="Loading opportunity" />;
  if (!opportunity || !opportunity.published)
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Opportunity not found"
          action={
            <Link href="/opportunities">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> All opportunities
              </Button>
            </Link>
          }
        />
      </div>
    );

  const days = daysUntil(opportunity.deadline);

  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <Link href="/opportunities" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Opportunities portal
      </Link>
      <Badge tone="secondary">{OPPORTUNITY_LABELS[opportunity.category]}</Badge>
      <h1 className="mt-3 text-3xl font-bold text-balance md:text-4xl">{opportunity.title}</h1>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <Building2 className="h-4 w-4" aria-hidden /> {opportunity.organisation}
        </span>
        {opportunity.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden /> {opportunity.location}
          </span>
        )}
        {opportunity.deadline && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden /> Deadline {formatDate(opportunity.deadline)}
            {days !== null && days >= 0 && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent-dark">
                {days} day{days === 1 ? "" : "s"} left
              </span>
            )}
          </span>
        )}
      </div>

      <p className="prose-body mt-8 text-sm md:text-base">{opportunity.description}</p>

      {opportunity.url && (
        <a href={opportunity.url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block">
          <Button size="lg">
            Apply / official page <ExternalLink className="h-4 w-4" aria-hidden />
          </Button>
        </a>
      )}
    </article>
  );
}
