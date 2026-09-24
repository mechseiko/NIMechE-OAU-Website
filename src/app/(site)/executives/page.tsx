"use client";

import { useMemo, useState } from "react";
import { PageHeader, SectionHeading, Spinner, EmptyState } from "@/components/ui/Feedback";
import { ProfileCard } from "@/components/domain/ProfileCard";
import { Select } from "@/components/ui/Field";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { Executive } from "@/types";

export default function ExecutivesPage() {
  const { data: executives, loading } = useCollection<Executive>(COL.executives);

  const current = useMemo(
    () => executives.filter((e) => e.current).sort((a, b) => a.order - b.order),
    [executives],
  );
  const administrations = useMemo(() => {
    const past = executives.filter((e) => !e.current);
    const grouped = new Map<string, Executive[]>();
    for (const exec of past) {
      const list = grouped.get(exec.administration) ?? [];
      list.push(exec);
      grouped.set(exec.administration, list);
    }
    return [...grouped.entries()]
      .map(([year, members]) => ({ year, members: members.sort((a, b) => a.order - b.order) }))
      .sort((a, b) => b.year.localeCompare(a.year));
  }, [executives]);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const visiblePast =
    selectedYear === "all" ? administrations : administrations.filter((a) => a.year === selectedYear);

  return (
    <>
      <PageHeader
        kicker="Executive council"
        title="The officers who carry the baton"
        description="Elected annually by the general congress — the current administration and every council that came before it."
      />

      <section className="container-page py-16" aria-labelledby="current-heading">
        <SectionHeading kicker="In office" title="Current executive council" />
        {loading ? (
          <Spinner />
        ) : current.length === 0 ? (
          <EmptyState title="No current executives published" message="The council will appear here once the administration publishes profiles." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {current.map((exec) => (
              <ProfileCard
                key={exec.id}
                name={exec.name}
                role={exec.position}
                photoUrl={exec.photoUrl}
                photoAlt={exec.photoAlt}
                email={exec.email}
                phone={exec.phone}
                message={exec.message}
              />
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-subtle py-16" aria-labelledby="past-heading">
        <div className="container-page">
          <SectionHeading
            kicker="Archive"
            title="Past administrations"
            description="Every executive council in the chapter's record — administration by administration."
            action={
              administrations.length > 0 ? (
                <Select
                  aria-label="Filter by administration"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  options={[
                    { value: "all", label: "All administrations" },
                    ...administrations.map((a) => ({ value: a.year, label: a.year })),
                  ]}
                  className="w-52"
                />
              ) : undefined
            }
          />
          {loading ? (
            <Spinner />
          ) : visiblePast.length === 0 ? (
            <EmptyState title="No past administrations archived yet" message="Historical councils will be added here session by session." />
          ) : (
            <div className="space-y-10">
              {visiblePast.map((group) => (
                <div key={group.year}>
                  <h3 className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 font-display text-sm font-bold text-primary-foreground">
                    {group.year} Administration
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {group.members.map((exec) => (
                      <ProfileCard key={exec.id} name={exec.name} role={exec.position} photoUrl={exec.photoUrl} photoAlt={exec.photoAlt} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
