import type { Election, ElectionStatus, FeeRecord, UserProfile, Vote } from "@/types";
import { fetchAll, COL } from "./db";

/** Time-aware status: a scheduled election opens/closes automatically. */
export function effectiveStatus(election: Election, now = Date.now()): ElectionStatus {
  if (election.status === "scheduled") {
    if (election.startsAt && new Date(election.startsAt).getTime() <= now) {
      if (!election.endsAt || new Date(election.endsAt).getTime() > now) return "active";
      return "closed";
    }
    return "scheduled";
  }
  if (election.status === "active" && election.endsAt) {
    if (new Date(election.endsAt).getTime() <= now) return "closed";
  }
  return election.status;
}

export function isVotingOpen(election: Election): boolean {
  return effectiveStatus(election) === "active";
}

export function resultsVisible(election: Election): boolean {
  const status = effectiveStatus(election);
  return election.publishedResults || (status === "closed" && election.liveResults) || status === "closed";
}

export function liveResultsVisible(election: Election): boolean {
  return election.liveResults && isVotingOpen(election);
}

export function voteDocId(electionId: string, positionId: string, voterUid: string): string {
  return `${electionId}_${positionId}_${voterUid}`;
}

export function feeDocId(matricNumber: string, academicYear: string): string {
  return `${matricNumber.trim().toUpperCase()}_${academicYear.trim()}`;
}

export interface Eligibility {
  eligible: boolean;
  reasons: string[];
}

export async function checkVoterEligibility(
  profile: UserProfile,
  election: Election,
  alreadyVotedPositionIds: string[],
): Promise<Eligibility> {
  const reasons: string[] = [];
  if (!profile.email || !profile.displayName) reasons.push("Complete your profile first.");
  if (election.requireFeeVerification && profile.matricNumber) {
    const fees = await fetchAll<FeeRecord>(COL.fees);
    const record = fees.find(
      (f) =>
        f.matricNumber.toUpperCase() === profile.matricNumber!.toUpperCase() &&
        f.academicYear === election.academicYear,
    );
    if (!record || record.status !== "paid") {
      reasons.push(
        "Departmental dues for this session are not verified as paid. See an executive if this is wrong.",
      );
    }
  } else if (election.requireFeeVerification && !profile.matricNumber) {
    reasons.push("Add your matric number in your dashboard — this election requires dues verification.");
  }
  return { eligible: reasons.length === 0, reasons };
}

export function hasVotedEverywhere(
  positionIds: string[],
  votedPositionIds: string[],
): boolean {
  return positionIds.every((id) => votedPositionIds.includes(id));
}

export interface TallyRow {
  candidateId: string;
  count: number;
}

export function tallyVotes(votes: Vote[], positionId: string): TallyRow[] {
  const counts = new Map<string, number>();
  for (const vote of votes) {
    if (vote.positionId !== positionId) continue;
    counts.set(vote.candidateId, (counts.get(vote.candidateId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([candidateId, count]) => ({ candidateId, count }))
    .sort((a, b) => b.count - a.count);
}

export function totalVotesForPosition(votes: Vote[], positionId: string): number {
  return votes.filter((v) => v.positionId === positionId).length;
}
