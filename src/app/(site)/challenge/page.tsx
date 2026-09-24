"use client";

import Link from "next/link";
import { Lightbulb, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { EventItem, GalleryItem } from "@/types";
import Image from "next/image";

export default function ChallengePage() {
  const { data: events, loading } = useCollection<EventItem>(COL.events);
  const { data: gallery } = useCollection<GalleryItem>(COL.gallery);

  const challenges = events
    .filter((e) => e.published && e.type === "challenge")
    .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  const photos = gallery.filter((g) => g.category === "achievement").slice(0, 6);

  return (
    <>
      <PageHeader
        kicker="Design & Innovation Challenge"
        title="The chapter's flagship engineering competition"
        description="Teams pitch, prototype and defend real engineering solutions before a jury of academics and industry engineers — the winner represents Great Ife at the national stage."
      />

      <section className="container-page grid gap-6 py-12 md:grid-cols-3" aria-label="How the challenge works">
        <article className="card p-6">
          <Lightbulb className="mb-3 h-7 w-7 text-secondary" aria-hidden />
          <h2 className="font-bold">1 · Concept & pitch</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Teams submit a problem statement and concept note. Shortlisted teams pitch their decks before
            a technical jury.
          </p>
        </article>
        <article className="card p-6">
          <Users className="mb-3 h-7 w-7 text-secondary" aria-hidden />
          <h2 className="font-bold">2 · Prototype sprint</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Finalists get workshop access and mentorship from staff advisers and alumni to build a working
            prototype.
          </p>
        </article>
        <article className="card p-6">
          <Trophy className="mb-3 h-7 w-7 text-secondary" aria-hidden />
          <h2 className="font-bold">3 · Exhibition & defence</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Prototypes are exhibited at the annual conference; the jury crowns the chapter's representative
            for the NIMechE national competition.
          </p>
        </article>
      </section>

      <section className="bg-surface-subtle py-16">
        <div className="container-page">
          <SectionHeading
            kicker="Editions"
            title="Challenge editions"
            action={
              <Link href="/contact">
                <Button variant="outline">Enter the next edition</Button>
              </Link>
            }
          />
          {loading ? (
            <Spinner />
          ) : challenges.length === 0 ? (
            <EmptyState icon={<Trophy className="h-6 w-6" aria-hidden />} title="No edition published yet" message="The next Design & Innovation Challenge will be announced here." />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ListingCard
                  key={challenge.id}
                  href={`/events/${challenge.id}`}
                  title={challenge.title}
                  description={challenge.description}
                  imageUrl={challenge.coverUrl}
                  imageAlt={challenge.coverAlt}
                  badge="Challenge"
                  badgeTone="accent"
                  meta={[formatDate(challenge.startDate), challenge.location].filter(Boolean)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {photos.length > 0 && (
        <section className="container-page py-16" aria-label="Challenge highlights">
          <SectionHeading kicker="Highlights" title="Moments from past editions" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image src={photo.imageUrl} alt={photo.alt} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
