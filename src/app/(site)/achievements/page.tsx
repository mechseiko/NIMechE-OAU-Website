"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { Tabs } from "@/components/ui/Tabs";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { ACHIEVEMENT_LABELS, type Achievement } from "@/types";

export default function AchievementsPage() {
  const { data: achievements, loading } = useCollection<Achievement>(COL.achievements);
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const list = category === "all" ? achievements : achievements.filter((a) => a.category === category);
    return [...list].sort((a, b) => b.year.localeCompare(a.year));
  }, [achievements, category]);

  return (
    <>
      <PageHeader
        kicker="Hall of fame"
        title="Achievements & laurels"
        description="Competition wins, awards, research milestones and ventures by members of the chapter — proof that Great Ife engineers deliver."
      />
      <section className="container-page py-12 md:py-16">
        <Tabs
          className="mb-8 max-w-3xl"
          active={category}
          onChange={setCategory}
          items={[
            { id: "all", label: "All", count: achievements.length },
            ...Object.entries(ACHIEVEMENT_LABELS).map(([id, label]) => ({
              id,
              label,
              count: achievements.filter((a) => a.category === id).length,
            })),
          ]}
        />
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-6 w-6" aria-hidden />}
            title="No achievements in this category yet"
            message="Wins and awards recorded by the chapter will be showcased here."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((achievement) => (
              <ListingCard
                key={achievement.id}
                title={achievement.title}
                description={achievement.description}
                imageUrl={achievement.imageUrl}
                badge={ACHIEVEMENT_LABELS[achievement.category]}
                badgeTone="accent"
                meta={[achievement.year, achievement.people.join(", ")].filter(Boolean)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
