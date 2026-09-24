"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Save, Vote, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, updateDocRaw } from "@/lib/db";
import { effectiveStatus } from "@/lib/elections";
import { errorMessage, formatDateTime, ROLE_LABELS } from "@/lib/utils";
import { profileSchema, type ProfileInput } from "@/lib/validation";
import type { Election, FeeRecord, Vote } from "@/types";

const LEVELS = ["100", "200", "300", "400", "500", "Postgraduate", "Alumni"];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const { data: votes } = useCollection<Vote>(COL.votes);
  const { data: elections } = useCollection<Election>(COL.elections);
  const { data: fees } = useCollection<FeeRecord>(COL.fees);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName ?? "",
        phone: profile.phone ?? "",
        matricNumber: profile.matricNumber ?? "",
        level: profile.level ?? "",
      });
    }
  }, [profile, reset]);

  const myVotes = useMemo(() => votes.filter((v) => v.voterUid === user?.uid), [votes, user]);
  const myFee = useMemo(
    () =>
      fees.find(
        (f) =>
          profile?.matricNumber &&
          f.matricNumber.toUpperCase() === profile.matricNumber.toUpperCase(),
      ),
    [fees, profile],
  );

  async function onSubmit(input: ProfileInput) {
    if (!user) return;
    try {
      await updateDocRaw(COL.users, user.uid, {
        displayName: input.displayName,
        phone: input.phone || null,
        matricNumber: input.matricNumber || null,
        level: input.level || null,
      });
      toast("Profile updated.");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  if (loading || !user) return <Spinner label="Loading your dashboard" />;

  return (
    <main id="main" className="container-page max-w-5xl py-12 md:py-16">
      <header className="mb-8">
        <p className="section-kicker">Member dashboard</p>
        <h1 className="section-title">Hello, {profile?.displayName ?? "member"} 👋</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
          <Badge tone="primary">{profile ? ROLE_LABELS[profile.role] : "Member"}</Badge>
          <span>{user.email}</span>
          {user.emailVerified ? (
            <span className="inline-flex items-center gap-1 text-success"><BadgeCheck className="h-4 w-4" aria-hidden /> Email verified</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-danger">Email not verified</span>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit(onSubmit)} className="card h-fit p-6" noValidate>
          <h2 className="mb-4 font-display text-lg font-bold">My profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Full name" required error={errors.displayName?.message} {...register("displayName")} />
            </div>
            <Input label="Matric number" placeholder="EGD/21/1234" hint="Needed for voting & dues checks" error={errors.matricNumber?.message} {...register("matricNumber")} />
            <Select label="Level" options={LEVELS.map((l) => ({ value: l, label: l }))} placeholder="Select level" error={errors.level?.message} {...register("level")} />
            <div className="sm:col-span-2">
              <Input label="Phone" type="tel" placeholder="0803 000 0000" error={errors.phone?.message} {...register("phone")} />
            </div>
          </div>
          <Button type="submit" className="mt-5" loading={isSubmitting} disabled={!isDirty}>
            <Save className="h-4 w-4" aria-hidden /> Save changes
          </Button>
        </form>

        <div className="space-y-6">
          <section className="card p-6" aria-labelledby="fee-heading">
            <h2 id="fee-heading" className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <Wallet className="h-5 w-5 text-secondary" aria-hidden /> Departmental dues
            </h2>
            {!profile?.matricNumber ? (
              <p className="text-sm text-ink-muted">Add your matric number to see your verification status.</p>
            ) : myFee ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{myFee.academicYear} session</p>
                  <p className="text-xs text-ink-muted">{myFee.matricNumber}</p>
                </div>
                <Badge tone={myFee.status === "paid" ? "success" : myFee.status === "pending" ? "accent" : "danger"}>
                  {myFee.status}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">
                No dues record found for this session. Pay at the departmental office and an executive will
                verify it here.
              </p>
            )}
          </section>

          <section className="card p-6" aria-labelledby="votes-heading">
            <h2 id="votes-heading" className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <Vote className="h-5 w-5 text-secondary" aria-hidden /> My voting record
            </h2>
            {myVotes.length === 0 ? (
              <p className="text-sm text-ink-muted">You haven't cast a vote yet.</p>
            ) : (
              <ul className="space-y-2">
                {myVotes.map((vote) => {
                  const election = elections.find((e) => e.id === vote.electionId);
                  return (
                    <li key={vote.id} className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle px-3 py-2 text-sm">
                      <span className="truncate font-semibold text-ink">{election?.title ?? vote.electionId}</span>
                      <span className="shrink-0 text-xs text-ink-muted">{formatDateTime(vote.votedAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            {elections.some((e) => effectiveStatus(e) === "active") && (
              <Link href="/elections" className="mt-4 inline-block">
                <Button variant="secondary" size="sm">Open ballot</Button>
              </Link>
            )}
          </section>

          {elections.length === 0 && myVotes.length === 0 && (
            <EmptyState title="Nothing here yet" message="Your votes and dues status will appear once elections run." />
          )}
        </div>
      </div>
    </main>
  );
}
