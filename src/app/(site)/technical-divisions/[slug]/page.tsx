"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Target, UserRound } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState, PageHeader, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { Button } from "@/components/ui/Button";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Project, TechnicalDivision } from "@/types";

export default function TechnicalDivisionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: divisions, loading } = useCollection<TechnicalDivision>(COL.divisions);
  const { data: projects } = useCollection<Project>(COL.projects);

  const division = divisions.find((d) => d.slug === slug);
  const divisionProjects = useMemo(
    () =>
      projects
        .filter((p) => p.published && division && p.divisionId === division.id)
        .sort((a, b) => b.academicYear.localeCompare(a.academicYear)),
    [projects, division],
  );

  if (loading) return <Spinner label="Loading division" />;
  if (!division)
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Division not found"
          message="This technical division doesn't exist or hasn't been published."
          action={
            <Link href="/technical-divisions">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> All divisions
              </Button>
            </Link>
          }
        />
      </div>
    );

  return (
    <>
      <PageHeader
        kicker={`Technical Division · ${division.code}`}
        title={division.name}
        description={division.description}
      >
        <Link href="/technical-divisions" className="mt-6 inline-block">
          <Button variant="outline" size="sm" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All divisions
          </Button>
        </Link>
      </PageHeader>

      <section className="container-page grid gap-6 py-12 md:grid-cols-3">
        <article className="card p-6">
          <Target className="mb-3 h-6 w-6 text-secondary" aria-hidden />
          <h2 className="font-bold text-ink">Focus areas</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {division.focusAreas.map((area) => (
              <li key={area} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {area}
              </li>
            ))}
          </ul>
        </article>
        <article className="card p-6">
          <UserRound className="mb-3 h-6 w-6 text-secondary" aria-hidden />
          <h2 className="font-bold text-ink">Coordination</h2>
          <p className="mt-3 text-sm text-ink-soft">
            {division.coordinator
              ? `Coordinated by ${division.coordinator}.`
              : "Coordinated by a divisional coordinator elected at the divisional congress each session."}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Divisional meetings, trainings and project reviews run throughout the academic session.
          </p>
        </article>
        <article className="card flex flex-col justify-between bg-primary p-6 text-primary-foreground">
          <div>
            <h2 className="font-bold">Division projects</h2>
            <p className="mt-2 text-sm text-primary-foreground/85">
              {divisionProjects.length} published project{divisionProjects.length === 1 ? "" : "s"} in the
              innovation hub.
            </p>
          </div>
          <Link href="/projects" className="mt-4 inline-block">
            <Button variant="accent" size="sm">Browse the hub</Button>
          </Link>
        </article>
      </section>

      <section className="bg-surface-subtle py-16">
        <div className="container-page">
          <SectionHeading kicker="Innovation hub" title={`Projects by ${division.code}`} />
          {divisionProjects.length === 0 ? (
            <EmptyState title="No projects published yet" message="Divisional projects will appear here once submitted to the hub." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {divisionProjects.map((project) => (
                <ListingCard
                  key={project.id}
                  href={`/projects/${project.id}`}
                  title={project.title}
                  description={project.summary}
                  imageUrl={project.coverUrl}
                  imageAlt={project.coverAlt}
                  badge={project.status}
                  badgeTone={statusTone(project.status)}
                  meta={[project.academicYear]}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
