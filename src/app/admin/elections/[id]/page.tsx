"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Users, Vote as VoteIcon } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { Input, Select, Switch, Textarea } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Modal } from "@/components/ui/Modal";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";
import { useCollection, useDoc } from "@/hooks/useCollection";
import { COL, createDoc, deleteDocAt, updateDocAt, updateDocRaw } from "@/lib/db";
import { effectiveStatus, tallyVotes, totalVotesForPosition } from "@/lib/elections";
import { errorMessage, nowIso } from "@/lib/utils";
import type { Candidate, Election, ElectionPosition, Vote } from "@/types";
import { ELECTION_STATUS_LABELS } from "@/types";

type Social = { label: string; url: string };

export default function AdminElectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { role } = useAuth();
  const { toast } = useToast();
  const isEditor = role === "editor";

  const { data: election, loading: loadingElection } = useDoc<Election>(COL.elections, id);
  const { data: allPositions } = useCollection<ElectionPosition>(COL.positions);
  const { data: allCandidates } = useCollection<Candidate>(COL.candidates);
  const { data: allVotes } = useCollection<Vote>(COL.votes);

  const positions = useMemo(
    () => allPositions.filter((p) => p.electionId === id).sort((a, b) => a.order - b.order),
    [allPositions, id],
  );
  const candidates = useMemo(
    () => allCandidates.filter((c) => c.electionId === id).sort((a, b) => a.order - b.order),
    [allCandidates, id],
  );
  const votes = useMemo(() => allVotes.filter((v) => v.electionId === id), [allVotes, id]);

  const [tab, setTab] = useState("positions");

  // Position modal state
  const [posModal, setPosModal] = useState(false);
  const [posEditing, setPosEditing] = useState<ElectionPosition | null>(null);
  const [posForm, setPosForm] = useState({ title: "", description: "", order: 0 });
  const [posSaving, setPosSaving] = useState(false);
  const [posDeleting, setPosDeleting] = useState<ElectionPosition | null>(null);

  // Candidate modal state
  const [candModal, setCandModal] = useState(false);
  const [candEditing, setCandEditing] = useState<Candidate | null>(null);
  const [candForm, setCandForm] = useState({
    fullName: "",
    positionId: "",
    matricNumber: "",
    level: "",
    slogan: "",
    manifesto: "",
    imageUrl: "",
    order: 0,
    socials: [] as Social[],
  });
  const [candErrors, setCandErrors] = useState<Record<string, string>>({});
  const [candSaving, setCandSaving] = useState(false);
  const [candDeleting, setCandDeleting] = useState<Candidate | null>(null);

  const [busy, setBusy] = useState(false);

  if (loadingElection) return <Spinner label="Loading election" />;
  if (!election)
    return (
      <EmptyState
        title="Election not found"
        message="It may have been deleted."
        action={
          <Link href="/admin/elections">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to elections
            </Button>
          </Link>
        }
      />
    );

  const eff = effectiveStatus(election);

  // ---------- Election controls ----------
  async function patch(payload: Record<string, unknown>, message: string) {
    setBusy(true);
    try {
      await updateDocRaw(COL.elections, id, payload);
      toast(message);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  }

  // ---------- Positions ----------
  function openPosCreate() {
    setPosEditing(null);
    setPosForm({ title: "", description: "", order: positions.length });
    setPosModal(true);
  }
  function openPosEdit(row: ElectionPosition) {
    setPosEditing(row);
    setPosForm({ title: row.title, description: row.description ?? "", order: row.order ?? 0 });
    setPosModal(true);
  }
  async function savePos() {
    if (!posForm.title.trim()) {
      toast("Position title is required.", "error");
      return;
    }
    setPosSaving(true);
    try {
      const payload = {
        electionId: id,
        title: posForm.title.trim(),
        description: posForm.description.trim(),
        order: Number(posForm.order) || 0,
      };
      if (posEditing) {
        await updateDocAt(COL.positions, posEditing.id, payload);
        toast("Position updated.");
      } else {
        await createDoc(COL.positions, { ...payload, createdAt: nowIso() } as never);
        toast("Position added.");
      }
      setPosModal(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setPosSaving(false);
    }
  }
  async function confirmDeletePos() {
    if (!posDeleting) return;
    try {
      const orphaned = candidates.filter((c) => c.positionId === posDeleting.id);
      await Promise.all(orphaned.map((c) => deleteDocAt(COL.candidates, c.id)));
      await deleteDocAt(COL.positions, posDeleting.id);
      toast("Position and its candidates deleted.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setPosDeleting(null);
    }
  }

  // ---------- Candidates ----------
  function openCandCreate() {
    setCandEditing(null);
    setCandForm({
      fullName: "",
      positionId: positions[0]?.id ?? "",
      matricNumber: "",
      level: "",
      slogan: "",
      manifesto: "",
      imageUrl: "",
      order: candidates.length,
      socials: [],
    });
    setCandErrors({});
    setCandModal(true);
  }
  function openCandEdit(row: Candidate) {
    setCandEditing(row);
    setCandForm({
      fullName: row.fullName ?? "",
      positionId: row.positionId ?? "",
      matricNumber: row.matricNumber ?? "",
      level: row.level ?? "",
      slogan: row.slogan ?? "",
      manifesto: row.manifesto ?? "",
      imageUrl: row.imageUrl ?? "",
      order: row.order ?? 0,
      socials: row.socials ?? [],
    });
    setCandErrors({});
    setCandModal(true);
  }
  function setCand<K extends keyof typeof candForm>(key: K, value: (typeof candForm)[K]) {
    setCandForm((f) => ({ ...f, [key]: value }));
  }
  async function saveCand() {
    const next: Record<string, string> = {};
    if (!candForm.fullName.trim()) next.fullName = "Candidate name is required";
    if (!candForm.positionId) next.positionId = "Choose the position they are contesting";
    setCandErrors(next);
    if (Object.keys(next).length) return;
    setCandSaving(true);
    try {
      const payload = {
        electionId: id,
        positionId: candForm.positionId,
        fullName: candForm.fullName.trim(),
        matricNumber: candForm.matricNumber.trim(),
        level: candForm.level.trim(),
        slogan: candForm.slogan.trim(),
        manifesto: candForm.manifesto.trim(),
        imageUrl: candForm.imageUrl,
        order: Number(candForm.order) || 0,
        socials: candForm.socials.filter((s) => s.label.trim() || s.url.trim()),
      };
      if (candEditing) {
        await updateDocAt(COL.candidates, candEditing.id, payload);
        toast("Candidate updated.");
      } else {
        await createDoc(COL.candidates, { ...payload, createdAt: nowIso() } as never);
        toast("Candidate added.");
      }
      setCandModal(false);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setCandSaving(false);
    }
  }
  async function confirmDeleteCand() {
    if (!candDeleting) return;
    try {
      await deleteDocAt(COL.candidates, candDeleting.id);
      toast("Candidate removed.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setCandDeleting(null);
    }
  }

  const positionTitle = (pid: string) => positions.find((p) => p.id === pid)?.title ?? "—";

  const positionColumns: Column<ElectionPosition>[] = [
    {
      key: "title",
      header: "Position",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{row.title}</p>
          {row.description && <p className="truncate text-xs text-ink-muted">{row.description}</p>}
        </div>
      ),
    },
    { key: "order", header: "Order", className: "w-20", render: (row) => row.order ?? 0 },
    {
      key: "candidates",
      header: "Candidates",
      className: "w-28",
      render: (row) => (
        <Badge tone={candidates.some((c) => c.positionId === row.id) ? "success" : "neutral"}>
          {candidates.filter((c) => c.positionId === row.id).length}
        </Badge>
      ),
    },
  ];

  const candidateColumns: Column<Candidate>[] = [
    {
      key: "name",
      header: "Candidate",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            <Image
              src={row.imageUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Users className="h-5 w-5" aria-hidden />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink">{row.fullName}</p>
            <p className="truncate text-xs text-ink-muted">
              {[row.level, row.matricNumber].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
      ),
    },
    { key: "position", header: "Contesting", render: (row) => positionTitle(row.positionId) },
    { key: "order", header: "Order", className: "w-20", render: (row) => row.order ?? 0 },
  ];

  const tabs: TabItem[] = [
    { id: "positions", label: "Positions", icon: <VoteIcon className="h-4 w-4" aria-hidden />, count: positions.length },
    { id: "candidates", label: "Candidates", icon: <Users className="h-4 w-4" aria-hidden />, count: candidates.length },
    { id: "results", label: "Results", count: votes.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/elections"
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-muted hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> All elections
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-ink">{election.title}</h1>
          <Badge tone={statusTone(eff)}>{ELECTION_STATUS_LABELS[eff]}</Badge>
          <span className="text-sm text-ink-muted">Session {election.academicYear}</span>
        </div>
      </div>

      {/* Live controls */}
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">Election controls</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={busy || isEditor}
              onClick={() => void patch({ status: "active" }, "Voting opened.")}
            >
              Open voting now
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || isEditor}
              onClick={() => void patch({ status: "closed" }, "Voting closed.")}
            >
              Close voting
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy || isEditor}
              onClick={() => void patch({ publishedResults: !election.publishedResults }, "Results visibility updated.")}
            >
              {election.publishedResults ? "Unpublish results" : "Publish results"}
            </Button>
          </div>
          <div className="grid gap-3">
            <Switch
              id="ctl-live"
              label="Live results while open"
              checked={Boolean(election.liveResults)}
              disabled={isEditor}
              onChange={(v) => void patch({ liveResults: v }, "Live results updated.")}
            />
            <Switch
              id="ctl-fee"
              label="Require fee verification to vote"
              checked={Boolean(election.requireFeeVerification)}
              disabled={isEditor}
              onChange={(v) => void patch({ requireFeeVerification: v }, "Eligibility rule updated.")}
            />
          </div>
        </div>
        {election.status === "scheduled" && (
          <p className="mt-3 text-xs text-ink-muted">
            This election is scheduled and will open/close automatically from its voting window. Use the buttons above
            only to override manually.
          </p>
        )}
      </section>

      <Tabs items={tabs} active={tab} onChange={setTab} />

      {tab === "positions" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!isEditor && (
              <Button onClick={openPosCreate}>
                <Plus className="h-4 w-4" aria-hidden /> Add position
              </Button>
            )}
          </div>
          <DataTable
            rows={positions}
            columns={positionColumns}
            emptyTitle="No positions yet"
            emptyMessage="Add the offices being contested, e.g. President, General Secretary, Financial Secretary."
            onEdit={isEditor ? undefined : openPosEdit}
            onDelete={isEditor ? undefined : (row) => setPosDeleting(row)}
            rowKey={(row) => row.id}
          />
        </div>
      )}

      {tab === "candidates" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!isEditor && (
              <Button onClick={openCandCreate} disabled={positions.length === 0}>
                <Plus className="h-4 w-4" aria-hidden /> Add candidate
              </Button>
            )}
          </div>
          {positions.length === 0 ? (
            <EmptyState title="Add a position first" message="Candidates must be attached to a contested position." />
          ) : (
            <DataTable
              rows={candidates}
              columns={candidateColumns}
              emptyTitle="No candidates yet"
              emptyMessage="Add each contestant with their portrait, level and manifesto."
              onEdit={isEditor ? undefined : openCandEdit}
              onDelete={isEditor ? undefined : (row) => setCandDeleting(row)}
              rowKey={(row) => row.id}
            />
          )}
        </div>
      )}

      {tab === "results" && (
        <ResultsView positions={positions} candidates={candidates} votes={votes} />
      )}

      {/* Position modal */}
      <Modal
        open={posModal}
        onClose={() => setPosModal(false)}
        title={posEditing ? "Edit position" : "New position"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPosModal(false)} disabled={posSaving}>
              Cancel
            </Button>
            <Button onClick={savePos} loading={posSaving}>
              {posEditing ? "Save" : "Add position"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <Input
            label="Position title"
            required
            value={posForm.title}
            onChange={(e) => setPosForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. President"
          />
          <Textarea
            label="Description (optional)"
            rows={3}
            value={posForm.description}
            onChange={(e) => setPosForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short note about the office."
          />
          <Input
            label="Display order"
            type="number"
            value={String(posForm.order)}
            onChange={(e) => setPosForm((f) => ({ ...f, order: Number(e.target.value) }))}
            hint="Lower numbers appear first on the ballot."
          />
        </div>
      </Modal>

      {/* Candidate modal */}
      <Modal
        open={candModal}
        onClose={() => setCandModal(false)}
        title={candEditing ? "Edit candidate" : "New candidate"}
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCandModal(false)} disabled={candSaving}>
              Cancel
            </Button>
            <Button onClick={saveCand} loading={candSaving}>
              {candEditing ? "Save changes" : "Add candidate"}
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload
              label="Candidate portrait"
              folder="candidates"
              value={candForm.imageUrl}
              aspect="aspect-square"
              onChange={(url) => setCand("imageUrl", url)}
            />
          </div>
          <Input
            label="Full name"
            required
            value={candForm.fullName}
            onChange={(e) => setCand("fullName", e.target.value)}
            error={candErrors.fullName}
          />
          <Select
            label="Contesting for"
            required
            options={positions.map((p) => ({ value: p.id, label: p.title }))}
            value={candForm.positionId}
            onChange={(e) => setCand("positionId", e.target.value)}
            error={candErrors.positionId}
          />
          <Input
            label="Matric number"
            value={candForm.matricNumber}
            onChange={(e) => setCand("matricNumber", e.target.value)}
          />
          <Input
            label="Level"
            value={candForm.level}
            onChange={(e) => setCand("level", e.target.value)}
            placeholder="e.g. 400 Level"
          />
          <Input
            label="Slogan"
            value={candForm.slogan}
            onChange={(e) => setCand("slogan", e.target.value)}
            placeholder="e.g. Servant leadership"
          />
          <Input
            label="Display order"
            type="number"
            value={String(candForm.order)}
            onChange={(e) => setCand("order", Number(e.target.value))}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Manifesto"
              rows={4}
              value={candForm.manifesto}
              onChange={(e) => setCand("manifesto", e.target.value)}
              placeholder="The candidate's agenda / manifesto."
            />
          </div>
          <div className="sm:col-span-2">
            <SocialsEditor value={candForm.socials} onChange={(s) => setCand("socials", s)} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(posDeleting)}
        title="Delete position"
        message={`“${posDeleting?.title ?? ""}” and all candidates contesting it will be permanently removed.`}
        onConfirm={confirmDeletePos}
        onCancel={() => setPosDeleting(null)}
      />
      <ConfirmDialog
        open={Boolean(candDeleting)}
        title="Remove candidate"
        message={`“${candDeleting?.fullName ?? ""}” will be removed from the ballot. Votes already cast for them remain recorded.`}
        confirmLabel="Remove"
        onConfirm={confirmDeleteCand}
        onCancel={() => setCandDeleting(null)}
      />
    </div>
  );
}

function SocialsEditor({ value, onChange }: { value: Social[]; onChange: (v: Social[]) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-ink">Social links (optional)</legend>
      {value.map((s, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label={`Social label ${i + 1}`}
            className="max-w-[140px]"
            value={s.label}
            placeholder="Label"
            onChange={(e) => {
              const next = [...value];
              next[i] = { ...next[i], label: e.target.value };
              onChange(next);
            }}
          />
          <Input
            aria-label={`Social URL ${i + 1}`}
            value={s.url}
            placeholder="https://…"
            onChange={(e) => {
              const next = [...value];
              next[i] = { ...next[i], url: e.target.value };
              onChange(next);
            }}
          />
          <IconButton label={`Remove social ${i + 1}`} variant="outline" onClick={() => onChange(value.filter((_, x) => x !== i))}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ))}
      <Button variant="outline" size="sm" className="self-start" onClick={() => onChange([...value, { label: "", url: "" }])}>
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add link
      </Button>
    </fieldset>
  );
}

function ResultsView({
  positions,
  candidates,
  votes,
}: {
  positions: ElectionPosition[];
  candidates: Candidate[];
  votes: Vote[];
}) {
  if (positions.length === 0)
    return <EmptyState title="No positions" message="Add positions and candidates to see results." />;

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        Live tally · <span className="font-semibold text-ink">{votes.length}</span> vote
        {votes.length === 1 ? "" : "s"} recorded so far.
      </p>
      {positions.map((pos) => {
        const posCandidates = candidates.filter((c) => c.positionId === pos.id);
        const tally = tallyVotes(votes, pos.id);
        const total = totalVotesForPosition(votes, pos.id);
        const countFor = (cid: string) => tally.find((t) => t.candidateId === cid)?.count ?? 0;
        return (
          <section key={pos.id} className="rounded-2xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg font-bold text-ink">{pos.title}</h3>
              <span className="text-xs font-semibold text-ink-muted">{total} votes</span>
            </div>
            {posCandidates.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">No candidates for this position yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {[...posCandidates]
                  .sort((a, b) => countFor(b.id) - countFor(a.id))
                  .map((c) => {
                    const count = countFor(c.id);
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <li key={c.id}>
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-ink">{c.fullName}</span>
                          <span className="tabular-nums text-ink-muted">
                            {count} · {pct}%
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunken">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${pct}%` }}
                            role="img"
                            aria-label={`${c.fullName}: ${count} votes, ${pct}%`}
                          />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
