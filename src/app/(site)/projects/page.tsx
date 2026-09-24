"use client";

import { useMemo, useState } from "react";
import { Lightbulb, Search } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/Badge";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { Input, Select } from "@/components/ui/Field";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Project, TechnicalDivision } from "@/types";

export default function ProjectsPage() {
  const { data: projects, loading } = useCollection<Project>(COL.projects);
  const { data: divisions } = useCollection<TechnicalDivision>(COL.divisions);

  const [search, setSearch] = useState("");
  const [divisionId, setDivisionId] = useState("all");
  const [status, setStatus] = useState("all");
  const [year, setYear] = useState("all");

  const years = useMemo(
    () => [...new Set(projects.map((p) => p.academicYear))].sort((a, b) => b.localeCompare(a)),
    [projects],
  );

  const filtered = useMemo(
    () =>
      projects
        .filter((p) => p.published)
        .filter((p) => (divisionId === "all" ? true : p.divisionId === divisionId))
        .filter((p) => (status === "all" ? true : p.status === status))
        .filter((p) => (year === "all" ? true : p.academicYear === year))
        .filter((p) => {
          if (!search.trim()) return true;
          const haystack = `${p.title} ${p.summary} ${p.tags.join(" ")}`.toLowerCase();
          return haystack.includes(search.trim().toLowerCase());
        })
        .sort((a, b) => b.academicYear.localeCompare(a.academicYear)),
    [projects, divisionId, status, year, search],
  );

  const divisionName = (id: string) => divisions.find((d) => d.id === id)?.code ?? "TD";

  return (
    <>
      <PageHeader
        kicker="Projects & Innovation Hub"
        title="Built by students, for the real world"
        description="Searchable archive of chapter projects — filter by technical division, status and academic year."
      />
      <section className="container-page py-12 md:py-16">
        <div className="card mb-8 grid gap-4 p-4 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input
              aria-label="Search projects"
              placeholder="Search projects, tags…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            aria-label="Filter by division"
            value={divisionId}
            onChange={(event) => setDivisionId(event.target.value)}
            options={[
              { value: "all", label: "All divisions" },
              ...divisions.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` })),
            ]}
          />
          <Select
            aria-label="Filter by status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "all", label: "All statuses" },
              { value: "proposed", label: "Proposed" },
              { value: "ongoing", label: "Ongoing" },
              { value: "completed", label: "Completed" },
            ]}
          />
          <Select
            aria-label="Filter by academic year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            options={[{ value: "all", label: "All sessions" }, ...years.map((y) => ({ value: y, label: y }))]}
          />
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Lightbulb className="h-6 w-6" aria-hidden />}
            title="No projects match your filters"
            message="Try clearing a filter, or submit your project to the hub through an executive."
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-muted" role="status">
              Showing {filtered.length} project{filtered.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((project) => (
                <ListingCard
                  key={project.id}
                  href={`/projects/${project.id}`}
                  title={project.title}
                  description={project.summary}
                  imageUrl={project.coverUrl}
                  imageAlt={project.coverAlt}
                  badge={project.status}
                  badgeTone={statusTone(project.status)}
                  meta={[divisionName(project.divisionId), project.academicYear]}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
