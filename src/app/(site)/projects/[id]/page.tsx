"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Tag, Users } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useCollection, useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Project, TechnicalDivision } from "@/types";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: project, loading } = useDoc<Project>(COL.projects, id);
  const { data: divisions } = useCollection<TechnicalDivision>(COL.divisions);

  if (loading) return <Spinner label="Loading project" />;
  if (!project || !project.published)
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Project not found"
          message="This project may have been unpublished or removed."
          action={
            <Link href="/projects">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back to hub
              </Button>
            </Link>
          }
        />
      </div>
    );

  const division = divisions.find((d) => d.id === project.divisionId);

  return (
    <article>
      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="gear-pattern absolute inset-0" aria-hidden />
        <div className="container-page relative py-14">
          <Link href="/projects" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Projects & Innovation Hub
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(project.status)}>{project.status}</Badge>
            {division && <Badge tone="accent">{division.code}</Badge>}
            <Badge tone="neutral">{project.academicYear}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-balance md:text-4xl">{project.title}</h1>
          <p className="mt-3 max-w-2xl text-primary-foreground/85">{project.summary}</p>
        </div>
      </header>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {project.coverUrl && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-card">
              <Image src={project.coverUrl} alt={project.coverAlt || project.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            </div>
          )}
          <h2 className="mb-3 text-xl font-bold">About the project</h2>
          <p className="prose-body text-sm md:text-base">{project.description}</p>

          {project.tags.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
                <Tag className="h-4 w-4" aria-hidden /> Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
              <Users className="h-4 w-4" aria-hidden /> Team
            </h2>
            <ul className="space-y-1.5 text-sm text-ink-soft">
              {project.teamMembers.length ? (
                project.teamMembers.map((member) => <li key={member}>{member}</li>)
              ) : (
                <li className="text-ink-muted">Team list not published.</li>
              )}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
              <CalendarDays className="h-4 w-4" aria-hidden /> Details
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Session</dt>
                <dd className="font-semibold text-ink">{project.academicYear}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Division</dt>
                <dd className="font-semibold text-ink">{division?.name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-muted">Status</dt>
                <dd className="font-semibold capitalize text-ink">{project.status}</dd>
              </div>
            </dl>
          </div>
          <div className="card bg-secondary-soft p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-secondary-dark">
              <MapPin className="h-4 w-4" aria-hidden /> Want to join a project?
            </h2>
            <p className="text-sm text-ink-soft">
              Project teams recruit at the start of each session. Reach the divisional coordinator or the
              Director of Projects.
            </p>
            <Link href="/contact" className="mt-3 inline-block">
              <Button variant="secondary" size="sm">Contact the council</Button>
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}
