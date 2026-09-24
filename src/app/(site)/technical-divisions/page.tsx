"use client";

import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { TechnicalDivision } from "@/types";

export default function TechnicalDivisionsPage() {
  const { data: divisions, loading } = useCollection<TechnicalDivision>(COL.divisions);

  return (
    <>
      <PageHeader
        kicker="Technical divisions"
        title="Seven engine rooms of the chapter"
        description="Divisions group members by discipline interest — running trainings, projects and competitions throughout the session."
      />
      <section className="container-page py-12 md:py-16">
        {loading ? (
          <Spinner />
        ) : divisions.length === 0 ? (
          <EmptyState icon={<Wrench className="h-6 w-6" aria-hidden />} title="Divisions not published yet" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {divisions.map((division) => (
              <Link
                key={division.id}
                href={`/technical-divisions/${division.slug}`}
                className="card group flex flex-col gap-3 p-6 transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground">
                    {division.code}
                  </span>
                  <ArrowRight className="h-5 w-5 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-secondary" aria-hidden />
                </div>
                <h2 className="font-display text-lg font-bold text-ink group-hover:text-primary">{division.name}</h2>
                <p className="text-sm text-ink-muted line-clamp-3">{division.description}</p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {division.focusAreas.slice(0, 3).map((area) => (
                    <span key={area} className="rounded-full bg-surface-sunken px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                      {area}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
