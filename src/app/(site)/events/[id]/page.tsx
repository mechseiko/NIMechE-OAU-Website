"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, ExternalLink, MapPin, Mic2, Presentation } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { ProfileCard } from "@/components/domain/ProfileCard";
import { useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { EVENT_TYPE_LABELS, type EventItem } from "@/types";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: event, loading } = useDoc<EventItem>(COL.events, id);

  if (loading) return <Spinner label="Loading event" />;
  if (!event || !event.published)
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Event not found"
          message="This event may have been unpublished or removed."
          action={
            <Link href="/conference">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Conference hub
              </Button>
            </Link>
          }
        />
      </div>
    );

  return (
    <article>
      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="gear-pattern absolute inset-0" aria-hidden />
        <div className="container-page relative py-14">
          <Link href="/conference" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Conference & Exhibition Hub
          </Link>
          <Badge tone="accent">{EVENT_TYPE_LABELS[event.type]}</Badge>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-balance md:text-4xl">{event.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-primary-foreground/85">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" aria-hidden />
              {formatDate(event.startDate)}
              {event.endDate && event.endDate !== event.startDate ? ` — ${formatDate(event.endDate)}` : ""}
            </span>
            {event.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden /> {event.location}
              </span>
            )}
          </div>
          {event.registrationUrl && (
            <a href={event.registrationUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
              <Button variant="secondary">
                Register for this event <ExternalLink className="h-4 w-4" aria-hidden />
              </Button>
            </a>
          )}
        </div>
      </header>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {event.coverUrl && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-card">
              <Image src={event.coverUrl} alt={event.coverAlt || event.title} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
            </div>
          )}
          <h2 className="mb-3 text-xl font-bold">About</h2>
          <p className="prose-body text-sm md:text-base">{event.description}</p>

          {event.agenda.length > 0 && (
            <section className="mt-10" aria-labelledby="agenda-heading">
              <SectionHeading kicker="Programme" title="Schedule & agenda" />
              <ol className="space-y-3">
                {event.agenda.map((item, index) => (
                  <li key={`${item.time}-${index}`} className="card flex gap-4 p-4">
                    <span className="flex h-10 w-24 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                      <Clock className="mr-1 h-3.5 w-3.5" aria-hidden />
                      {item.time}
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      {item.detail && <p className="mt-0.5 text-sm text-ink-muted">{item.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="speakers-heading">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
              <Mic2 className="h-4 w-4" aria-hidden /> Speakers & panelists
            </h2>
            {event.speakers.length === 0 ? (
              <p className="text-sm text-ink-muted">Lineup to be announced.</p>
            ) : (
              <div className="grid gap-4">
                {event.speakers.map((speaker) => (
                  <ProfileCard
                    key={speaker.name}
                    name={speaker.name}
                    role={speaker.title}
                    subtitle={speaker.organisation}
                    photoUrl={speaker.photoUrl}
                    message={speaker.topic}
                  />
                ))}
              </div>
            )}
          </section>

          {event.pitchDecks.length > 0 && (
            <section className="card p-5" aria-labelledby="decks-heading">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-muted">
                <Presentation className="h-4 w-4" aria-hidden /> Student pitch decks
              </h2>
              <ul className="space-y-2">
                {event.pitchDecks.map((deck) => (
                  <li key={deck.url}>
                    <a href={deck.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden /> {deck.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </article>
  );
}
