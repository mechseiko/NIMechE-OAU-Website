"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Mic2, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { ListingCard, MetaCalendar, MetaLocation } from "@/components/domain/ListingCard";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { EVENT_TYPE_LABELS, type EventItem } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ConferencePage() {
  const { data: events, loading } = useCollection<EventItem>(COL.events);

  const conferenceEvents = useMemo(
    () =>
      events
        .filter((e) => e.published && (e.type === "conference" || e.type === "exhibition" || e.type === "workshop"))
        .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")),
    [events],
  );
  const featured = conferenceEvents[0];
  const rest = conferenceEvents.slice(1);

  return (
    <>
      <PageHeader
        kicker="Conference & Exhibition Hub"
        title="Where Great Ife engineering meets the world"
        description="Annual conferences, technical exhibitions, workshops — schedules, speakers, registration and student pitch decks."
      />

      {loading ? (
        <div className="container-page py-16">
          <Spinner />
        </div>
      ) : conferenceEvents.length === 0 ? (
        <div className="container-page py-16">
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" aria-hidden />}
            title="No conference published yet"
            message="The next conference or exhibition will be announced here with full schedule and speakers."
          />
        </div>
      ) : (
        <>
          {featured && (
            <section className="container-page py-12" aria-label="Featured conference">
              <div className="card grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">
                <div className="p-8">
                  <Badge tone="secondary">{EVENT_TYPE_LABELS[featured.type]}</Badge>
                  <h2 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">{featured.title}</h2>
                  <p className="mt-3 text-sm text-ink-soft md:text-base">{featured.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
                    <MetaCalendar date={featured.startDate} />
                    <MetaLocation location={featured.location} />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/events/${featured.id}`}>
                      <Button>Schedule & speakers</Button>
                    </Link>
                    {featured.registrationUrl && (
                      <a href={featured.registrationUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="secondary">Register</Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="border-t border-line bg-surface-subtle p-8 lg:border-l lg:border-t-0">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
                    <Mic2 className="h-4 w-4" aria-hidden /> Speakers & panelists
                  </h3>
                  {featured.speakers.length === 0 ? (
                    <p className="text-sm text-ink-muted">Speaker lineup to be announced.</p>
                  ) : (
                    <ul className="space-y-3">
                      {featured.speakers.slice(0, 4).map((speaker) => (
                        <li key={speaker.name} className="flex items-start gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" aria-hidden />
                          <div>
                            <p className="text-sm font-semibold text-ink">{speaker.name}</p>
                            <p className="text-xs text-ink-muted">
                              {speaker.title} · {speaker.organisation}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {featured.pitchDecks.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
                        <Presentation className="h-4 w-4" aria-hidden /> Student pitch decks
                      </h3>
                      <ul className="space-y-1.5">
                        {featured.pitchDecks.map((deck) => (
                          <li key={deck.url}>
                            <a href={deck.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                              {deck.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          <section className="bg-surface-subtle py-16">
            <div className="container-page">
              <SectionHeading kicker="Archive & upcoming" title="All conferences, exhibitions & workshops" />
              {rest.length === 0 ? (
                <EmptyState title="Nothing else scheduled" message="Past and upcoming editions will accumulate here." />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((event) => (
                    <ListingCard
                      key={event.id}
                      href={`/events/${event.id}`}
                      title={event.title}
                      description={event.description}
                      imageUrl={event.coverUrl}
                      imageAlt={event.coverAlt}
                      badge={EVENT_TYPE_LABELS[event.type]}
                      badgeTone="secondary"
                      meta={[formatDate(event.startDate), event.location].filter(Boolean)}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
