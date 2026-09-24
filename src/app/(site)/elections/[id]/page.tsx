"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, CheckCircle2, Trophy, Vote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { useAuth } from "@/context/AuthProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { effectiveStatus, resultsVisible, tallyVotes, totalVotesForPosition } from "@/lib/elections";
import { formatDateTime } from "@/lib/utils";
import { ELECTION_STATUS_LABELS, type Candidate, type Election, type ElectionPosition, type Vote as VoteRecord } from "@/types";

export default function ElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: elections, loading } = useCollection<Election>(COL.elections);
  const { data: positions } = useCollection<ElectionPosition>(COL.positions);
  const { data: candidates } = useCollection<Candidate>(COL.candidates);
  const { data: votes } = useCollection<VoteRecord>(COL.votes);

  const election = elections.find((e) => e.id === id);
  const electionPositions = useMemo(
    () => positions.filter((p) => p.electionId === id).sort((a, b) => a.order - b.order),
    [positions, id],
  );
  const electionVotes = useMemo(() => votes.filter((v) => v.electionId === id), [votes, id]);

  if (loading) return <Spinner label="Loading election" />;
  if (!election)
    return (
      <div className="container-page py-20">
        <EmptyState title="Election not found" action={<Link href="/elections"><Button variant="outline"><ArrowLeft className="h-4 w-4" aria-hidden /> All elections</Button></Link>} />
      </div>
    );

  const status = effectiveStatus(election);
  const showResults = resultsVisible(election);

  return (
    <>
      <PageHeader
        kicker={`${election.academicYear} session`}
        title={election.title}
        description={election.description}
      >
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Badge tone={status === "active" ? "success" : status === "closed" ? "neutral" : "accent"}>
            {ELECTION_STATUS_LABELS[status]}
          </Badge>
          {election.startsAt && (
            <span className="text-sm text-primary-foreground/85">Opens {formatDateTime(election.startsAt)}</span>
          )}
          {election.endsAt && (
            <span className="text-sm text-primary-foreground/85">Closes {formatDateTime(election.endsAt)}</span>
          )}
          {status === "active" && (
            <Link href={`/vote/${election.id}`}>
              <Button variant="secondary" size="sm">
                <Vote className="h-4 w-4" aria-hidden /> Go to ballot
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      <section className="container-page space-y-12 py-12 md:py-16">
        {electionPositions.length === 0 ? (
          <EmptyState title="Positions not published yet" message="The electoral committee will publish contested positions here." />
        ) : (
          electionPositions.map((position) => {
            const positionCandidates = candidates
              .filter((c) => c.positionId === position.id)
              .sort((a, b) => a.order - b.order);
            const tally = tallyVotes(electionVotes, position.id);
            const total = totalVotesForPosition(electionVotes, position.id);
            const winnerId = tally.length > 0 && tally[0].count > 0 ? tally[0].candidateId : null;
            const isTie = tally.length > 1 && tally[0].count === tally[1].count;

            return (
              <div key={position.id} aria-labelledby={`pos-${position.id}`}>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="section-kicker">Contested office</p>
                    <h2 id={`pos-${position.id}`} className="section-title">{position.title}</h2>
                    {position.description && <p className="mt-1 text-sm text-ink-muted">{position.description}</p>}
                  </div>
                  {showResults && total > 0 && (
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                      <BarChart3 className="h-4 w-4" aria-hidden /> {total} vote{total === 1 ? "" : "s"} cast
                    </p>
                  )}
                </div>

                {positionCandidates.length === 0 ? (
                  <EmptyState title="No candidates nominated yet" />
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {positionCandidates.map((candidate) => {
                      const count = tally.find((t) => t.candidateId === candidate.id)?.count ?? 0;
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isWinner = showResults && winnerId === candidate.id && !isTie;
                      return (
                        <article
                          key={candidate.id}
                          className={`card flex flex-col overflow-hidden ${isWinner ? "ring-2 ring-accent" : ""}`}
                        >
                          <div className="relative aspect-[4/3] bg-surface-sunken">
                            {candidate.imageUrl ? (
                              <Image src={candidate.imageUrl} alt={`Portrait of ${candidate.fullName}`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-4xl font-bold text-ink-muted">
                                {candidate.fullName.slice(0, 1)}
                              </div>
                            )}
                            {isWinner && (
                              <span className="absolute right-3 top-3">
                                <Badge tone="accent">
                                  <Trophy className="h-3 w-3" aria-hidden /> Elected
                                </Badge>
                              </span>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-5">
                            <h3 className="font-display text-lg font-bold text-ink">{candidate.fullName}</h3>
                            {candidate.slogan && <p className="text-sm italic text-secondary">“{candidate.slogan}”</p>}
                            <p className="text-xs text-ink-muted">
                              {[candidate.level, candidate.matricNumber].filter(Boolean).join(" · ") || "Member of the chapter"}
                            </p>
                            {candidate.manifesto && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-primary">
                                  Manifesto
                                </summary>
                                <p className="prose-body mt-2 text-xs text-ink-soft">{candidate.manifesto}</p>
                              </details>
                            )}
                            {showResults && total > 0 && (
                              <div className="mt-auto pt-3">
                                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-muted">
                                  <span>{count} vote{count === 1 ? "" : "s"}</span>
                                  <span>{percent}%</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-surface-sunken" role="img" aria-label={`${candidate.fullName}: ${percent} percent of votes`}>
                                  <div
                                    className={`h-full rounded-full ${isWinner ? "bg-accent" : "bg-primary"}`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
                {showResults && isTie && total > 0 && (
                  <p className="mt-3 flex items-center gap-2 rounded-lg bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-dark">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> This position is currently tied — run-offs follow the chapter constitution.
                  </p>
                )}
              </div>
            );
          })
        )}

        {!user && status === "active" && (
          <div className="card bg-primary-soft p-6 text-center">
            <h2 className="font-display text-lg font-bold text-primary">Want to vote?</h2>
            <p className="mt-1 text-sm text-ink-soft">Sign in with your member account to receive a ballot.</p>
            <Link href={`/login?next=/vote/${election.id}`} className="mt-4 inline-block">
              <Button>Sign in to vote</Button>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
