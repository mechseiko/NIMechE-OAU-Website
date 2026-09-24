"use client";

import Link from "next/link";
import { ArrowRight, Lock, Vote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { effectiveStatus } from "@/lib/elections";
import { formatDateTime } from "@/lib/utils";
import { ELECTION_STATUS_LABELS, type Election } from "@/types";

export default function ElectionsPage() {
  const { data: elections, loading } = useCollection<Election>(COL.elections);

  const sorted = [...elections].sort((a, b) => b.academicYear.localeCompare(a.academicYear));
  const active = sorted.filter((e) => effectiveStatus(e) === "active");
  const upcoming = sorted.filter((e) => effectiveStatus(e) === "scheduled" || effectiveStatus(e) === "draft");
  const past = sorted.filter((e) => effectiveStatus(e) === "closed");

  return (
    <>
      <PageHeader
        kicker="Democracy in motion"
        title="Elections & voting"
        description="Every session the chapter goes to the polls. View live elections, cast your ballot as a verified member, and browse archived results."
      />
      <section className="container-page space-y-12 py-12 md:py-16">
        <div aria-labelledby="active-heading">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Vote className="h-5 w-5 text-secondary" aria-hidden /> Voting open now
          </h2>
          {loading ? (
            <Spinner />
          ) : active.length === 0 ? (
            <EmptyState
              icon={<Vote className="h-6 w-6" aria-hidden />}
              title="No election is currently open"
              message="When the electoral committee opens the polls, the ballot appears here and on your dashboard."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {active.map((election) => (
                <ElectionCard key={election.id} election={election} highlight />
              ))}
            </div>
          )}
        </div>

        {upcoming.length > 0 && (
          <div aria-labelledby="upcoming-heading">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Lock className="h-5 w-5 text-ink-muted" aria-hidden /> Scheduled & drafts
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {upcoming.map((election) => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          </div>
        )}

        <div aria-labelledby="past-heading">
          <h2 className="mb-4 text-xl font-bold">Archive & results</h2>
          {past.length === 0 && !loading ? (
            <EmptyState title="No past elections archived yet" message="Closed elections and their results will be preserved here for every administration." />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {past.map((election) => (
                <ElectionCard key={election.id} election={election} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ElectionCard({ election, highlight }: { election: Election; highlight?: boolean }) {
  const status = effectiveStatus(election);
  return (
    <article
      className={`card flex flex-col gap-3 p-6 transition-shadow hover:shadow-lift ${
        highlight ? "border-secondary ring-2 ring-secondary/30" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-secondary">{election.academicYear} session</p>
          <h3 className="mt-1 font-display text-lg font-bold text-ink">{election.title}</h3>
        </div>
        <Badge tone={status === "active" ? "success" : status === "closed" ? "neutral" : "accent"}>
          {ELECTION_STATUS_LABELS[status]}
        </Badge>
      </div>
      {election.description && <p className="text-sm text-ink-muted line-clamp-2">{election.description}</p>}
      <p className="text-xs text-ink-muted">
        {status === "scheduled" && election.startsAt && `Opens ${formatDateTime(election.startsAt)}`}
        {status === "active" && election.endsAt && `Closes ${formatDateTime(election.endsAt)}`}
        {status === "closed" && "Voting closed — results available"}
      </p>
      <div className="mt-auto pt-2">
        <Link href={`/elections/${election.id}`}>
          <Button variant={highlight ? "secondary" : "outline"} className="w-full">
            {status === "active" ? "View ballot" : status === "closed" ? "View results" : "View election"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </article>
  );
}
