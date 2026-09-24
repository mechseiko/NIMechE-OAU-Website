"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Vote as VoteIcon, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import { writeBatch } from "firebase/firestore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, ref } from "@/lib/db";
import { db } from "@/lib/firebase";
import { checkVoterEligibility, effectiveStatus, voteDocId } from "@/lib/elections";
import { cn, errorMessage, nowIso } from "@/lib/utils";
import type { Candidate, Election, ElectionPosition, Vote } from "@/types";

export default function VotePage({ params }: { params: Promise<{ electionId: string }> }) {
  const { electionId } = use(params);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: elections } = useCollection<Election>(COL.elections);
  const { data: positions } = useCollection<ElectionPosition>(COL.positions);
  const { data: candidates } = useCollection<Candidate>(COL.candidates);
  const { data: votes } = useCollection<Vote>(COL.votes);

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons: string[] } | null>(null);

  const election = elections.find((e) => e.id === electionId);
  const electionPositions = useMemo(
    () => positions.filter((p) => p.electionId === electionId).sort((a, b) => a.order - b.order),
    [positions, electionId],
  );
  const myVotes = useMemo(
    () => votes.filter((v) => v.electionId === electionId && v.voterUid === user?.uid),
    [votes, electionId, user],
  );
  const votedPositionIds = myVotes.map((v) => v.positionId);
  const pendingPositions = electionPositions.filter((p) => !votedPositionIds.includes(p.id));

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=/vote/${electionId}`);
  }, [authLoading, user, router, electionId]);

  useEffect(() => {
    if (!profile || !election) return;
    void checkVoterEligibility(profile, election, votedPositionIds).then(setEligibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, election, votedPositionIds.length]);

  if (authLoading || !user) return <Spinner label="Checking your session" />;
  if (!election) return <div className="container-page py-20"><EmptyState title="Election not found" /></div>;

  const status = effectiveStatus(election);
  const allVoted = pendingPositions.length === 0 && electionPositions.length > 0;

  async function submitBallot() {
    if (!user || !election) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(db());
      for (const position of pendingPositions) {
        const candidateId = selections[position.id];
        if (!candidateId) continue;
        batch.set(ref(COL.votes, voteDocId(election.id, position.id, user.uid)), {
          electionId: election.id,
          positionId: position.id,
          candidateId,
          voterUid: user.uid,
          votedAt: nowIso(),
        });
      }
      await batch.commit();
      setConfirmOpen(false);
      setSubmitted(true);
      toast("Your ballot has been cast. Thank you for participating in chapter democracy!");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  const chosenCount = pendingPositions.filter((p) => selections[p.id]).length;

  return (
    <main id="main" className="container-page max-w-4xl py-12 md:py-16">
      <header className="mb-8 text-center">
        <Badge tone={status === "active" ? "success" : "neutral"}>{status === "active" ? "Ballot open" : status}</Badge>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">{election.title}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {election.academicYear} session · Your ballot is secret — only aggregate totals are ever displayed.
        </p>
      </header>

      {submitted || allVoted ? (
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8 text-success" aria-hidden />}
          title="Ballot received — thank you!"
          message="You have voted for every position in this election. Results are published when the polls close."
          action={
            <Link href={`/elections/${election.id}`}>
              <Button variant="outline">View election page</Button>
            </Link>
          }
        />
      ) : status !== "active" ? (
        <EmptyState
          icon={<Lock className="h-8 w-8" aria-hidden />}
          title="The polls are not open"
          message={status === "closed" ? "This election has closed. Visit the election page for results." : "Voting has not started yet. Check back when the electoral committee opens the polls."}
          action={<Link href={`/elections/${election.id}`}><Button variant="outline">Election page</Button></Link>}
        />
      ) : eligibility === null ? (
        <Spinner label="Verifying your eligibility" />
      ) : !eligibility.eligible ? (
        <div className="card border-danger/30 bg-danger-soft p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-danger" aria-hidden />
          <h2 className="mt-3 text-xl font-bold text-danger">You’re not eligible to vote yet</h2>
          <ul className="mx-auto mt-3 max-w-md space-y-1 text-sm text-ink-soft">
            {eligibility.reasons.map((reason) => (
              <li key={reason}>· {reason}</li>
            ))}
          </ul>
          <Link href="/dashboard" className="mt-5 inline-block">
            <Button variant="outline">Update my profile</Button>
          </Link>
        </div>
      ) : (
        <>
          <form
            className="space-y-10"
            onSubmit={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            {pendingPositions.map((position) => {
              const positionCandidates = candidates
                .filter((c) => c.positionId === position.id)
                .sort((a, b) => a.order - b.order);
              return (
                <fieldset key={position.id} className="card p-6">
                  <legend className="px-2 font-display text-lg font-bold text-ink">
                    {position.title}
                    <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      choose one
                    </span>
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {positionCandidates.map((candidate) => {
                      const selected = selections[position.id] === candidate.id;
                      return (
                        <label
                          key={candidate.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-3 transition-colors",
                            selected ? "border-secondary bg-secondary-soft" : "border-line hover:border-secondary/50",
                          )}
                        >
                          <input
                            type="radio"
                            name={`position-${position.id}`}
                            value={candidate.id}
                            checked={selected}
                            onChange={() => setSelections((s) => ({ ...s, [position.id]: candidate.id }))}
                            className="h-4 w-4 accent-[var(--color-secondary)]"
                          />
                          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-sunken">
                            {candidate.imageUrl && (
                              <Image src={candidate.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink">{candidate.fullName}</span>
                            {candidate.slogan && (
                              <span className="block truncate text-xs italic text-ink-muted">“{candidate.slogan}”</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                    {positionCandidates.length === 0 && (
                      <p className="text-sm text-ink-muted sm:col-span-2">Unopposed or awaiting nominations.</p>
                    )}
                  </div>
                </fieldset>
              );
            })}

            <div className="sticky bottom-4 rounded-xl border border-line bg-surface/95 p-4 shadow-lift backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-soft" role="status">
                  {chosenCount} of {pendingPositions.length} position{pendingPositions.length === 1 ? "" : "s"} selected
                </p>
                <Button type="submit" size="lg" disabled={chosenCount === 0}>
                  <VoteIcon className="h-5 w-5" aria-hidden /> Submit ballot
                </Button>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                Unselected positions are skipped. You can return later to vote for them while polls are open.
              </p>
            </div>
          </form>

          <Modal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Confirm your ballot"
            size="sm"
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                  Review again
                </Button>
                <Button onClick={submitBallot} loading={submitting}>Cast my vote</Button>
              </div>
            }
          >
            <p className="text-sm text-ink-soft">
              Your vote is final and cannot be changed once submitted. You are voting for:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {pendingPositions
                .filter((p) => selections[p.id])
                .map((p) => {
                  const candidate = candidates.find((c) => c.id === selections[p.id]);
                  return (
                    <li key={p.id} className="flex justify-between gap-4 rounded-lg bg-surface-subtle px-3 py-2">
                      <span className="font-semibold text-ink">{p.title}</span>
                      <span className="text-secondary">{candidate?.fullName}</span>
                    </li>
                  );
                })}
            </ul>
          </Modal>
        </>
      )}
    </main>
  );
}
