"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone, Users, Vote, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton, EmptyState, SectionHeading } from "@/components/ui/Feedback";
import { ListingCard, MetaCalendar, MetaLocation } from "@/components/domain/ListingCard";
import { useCollection, useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { effectiveStatus } from "@/lib/elections";
import { formatDate } from "@/lib/utils";
import type { Election, EventItem, NewsPost, SiteSettings, TechnicalDivision } from "@/types";

export default function HomePage() {
  const { data: settings } = useDoc<SiteSettings>(COL.settings, "site");
  const { data: news, loading: newsLoading } = useCollection<NewsPost>(COL.news);
  const { data: events } = useCollection<EventItem>(COL.events);
  const { data: divisions } = useCollection<TechnicalDivision>(COL.divisions);
  const { data: elections } = useCollection<Election>(COL.elections);

  const publishedNews = news
    .filter((post) => post.published)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 3);
  const upcomingEvents = events
    .filter((event) => event.published)
    .sort((a, b) => (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999"))
    .slice(0, 3);
  const activeElection = elections.find((election) => effectiveStatus(election) === "active");

  const stats = settings?.stats?.length
    ? settings.stats
    : [
        { label: "Technical Divisions", value: "7" },
        { label: "Years of Legacy", value: "30+" },
        { label: "Student Members", value: "600+" },
        { label: "Projects Delivered", value: "40+" },
      ];

  return (
    <>
      {settings?.announcementActive && settings?.announcement && (
        <div role="region" aria-label="Announcement" className="bg-accent text-accent-foreground">
          <div className="container-page flex items-center gap-2 py-2 text-sm font-semibold">
            <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
            <p className="truncate">{settings.announcement}</p>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="gear-pattern absolute inset-0" aria-hidden />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full border-[34px] border-secondary/25" aria-hidden />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full border-[40px] border-accent/20" aria-hidden />
        <div className="container-page relative grid gap-10 py-16 md:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="animate-fade-up">
            <Badge tone="accent" className="mb-4">
              OAU Students&apos; Chapter · Ile-Ife
            </Badge>
            <h1 className="text-4xl font-bold leading-tight text-balance md:text-5xl lg:text-6xl">
              {settings?.heroTitle ??
                "Engineering excellence, manufactured for man's comfort."}
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/85 md:text-lg">
              {settings?.heroSubtitle ??
                "The Nigerian Institution of Mechanical Engineers (NIMechE), Obafemi Awolowo University Students' Chapter — training leaders, builders and innovators from the Department of Mechanical Engineering, Great Ife."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/elections">
                <Button variant="secondary" size="lg">
                  <Vote className="h-5 w-5" aria-hidden /> Elections & Voting
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="accent" size="lg">
                  Discover the chapter <ArrowRight className="h-5 w-5" aria-hidden />
                </Button>
              </Link>
              <Link href="/opportunities">
                <Button
                  size="lg"
                  className="border border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Opportunities
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 animate-fade-up">
            <Image
              src="/images/logo-nimeche.jpg"
              alt="NIMechE emblem — cogwheel of the Nigerian Institution of Mechanical Engineers"
              width={260}
              height={260}
              priority
              className="h-52 w-52 rounded-full object-cover shadow-lift ring-4 ring-accent md:h-64 md:w-64"
            />
            <Image
              src="/images/logo-oau.jpg"
              alt="Obafemi Awolowo University crest"
              width={140}
              height={140}
              className="hidden h-28 w-28 rounded-full object-cover shadow-lift ring-4 ring-primary-foreground/30 md:block"
            />
          </div>
        </div>
        <div className="relative border-t border-primary-foreground/15 bg-primary-dark/40">
          <dl className="container-page grid grid-cols-2 gap-6 py-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="order-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
                  {stat.label}
                </dt>
                <dd className="font-display text-3xl font-bold text-accent">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ACTIVE ELECTION BANNER */}
      {activeElection && (
        <section aria-label="Active election" className="bg-secondary text-secondary-foreground">
          <div className="container-page flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
            <p className="flex items-center gap-2 text-sm font-semibold md:text-base">
              <Vote className="h-5 w-5 shrink-0" aria-hidden />
              {activeElection.title} — voting is open until {formatDate(activeElection.endsAt, true)}.
            </p>
            <Link href={`/elections/${activeElection.id}`}>
              <Button variant="accent" size="sm">
                Cast your vote <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* NEWS */}
      <section className="container-page py-16 md:py-20" aria-labelledby="news-heading">
        <SectionHeading
          kicker="Newsroom"
          title="Latest news & announcements"
          description="Official communiqués from the Executive Council — meetings, deadlines, wins and everything in between."
          action={
            <Link href="/news">
              <Button variant="outline">
                All news <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {newsLoading
            ? [0, 1, 2].map((i) => <CardSkeleton key={i} />)
            : publishedNews.map((post) => (
                <ListingCard
                  key={post.id}
                  href={`/news/${post.slug ?? post.id}`}
                  title={post.title}
                  description={post.excerpt}
                  imageUrl={post.coverUrl}
                  imageAlt={post.coverAlt}
                  badge={post.category}
                  meta={[formatDate(post.createdAt)]}
                />
              ))}
          {!newsLoading && publishedNews.length === 0 && (
            <div className="md:col-span-3">
              <EmptyState
                title="No news published yet"
                message="Announcements from the Executive Council will appear here once published."
              />
            </div>
          )}
        </div>
      </section>

      {/* EVENTS */}
      <section className="bg-surface-subtle py-16 md:py-20" aria-labelledby="events-heading">
        <div className="container-page">
          <SectionHeading
            kicker="Calendar"
            title="Upcoming events & programmes"
            description="Conferences, exhibitions, industrial trips, trainings and the Design & Innovation Challenge."
            action={
              <Link href="/conference">
                <Button variant="outline">
                  Conference hub <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </Link>
            }
          />
          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <ListingCard
                key={event.id}
                href={`/events/${event.id}`}
                title={event.title}
                description={event.description}
                imageUrl={event.coverUrl}
                imageAlt={event.coverAlt}
                badge={event.type}
                badgeTone="secondary"
                meta={[
                  <MetaCalendar key="d" date={event.startDate} />,
                  <MetaLocation key="l" location={event.location} />,
                ]}
              />
            ))}
            {upcomingEvents.length === 0 && (
              <div className="md:col-span-3">
                <EmptyState
                  icon={<CalendarDays className="h-6 w-6" aria-hidden />}
                  title="No upcoming events"
                  message="The chapter calendar is quiet for now — check back after the next EXCO meeting."
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DIVISIONS */}
      <section className="container-page py-16 md:py-20" aria-labelledby="divisions-heading">
        <SectionHeading
          kicker="Technical Divisions"
          title="Seven divisions, one mission"
          description="Every member belongs to a technical division — the engine rooms of our professional development."
          action={
            <Link href="/technical-divisions">
              <Button variant="outline">
                Explore divisions <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </Link>
          }
        />
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {divisions.map((division) => (
            <li key={division.id}>
              <Link
                href={`/technical-divisions/${division.slug}`}
                className="card flex h-full flex-col items-center gap-2 p-4 text-center transition-all hover:-translate-y-1 hover:border-secondary hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">
                  {division.code}
                </span>
                <span className="text-xs font-semibold text-ink line-clamp-2">{division.name}</span>
              </Link>
            </li>
          ))}
          {divisions.length === 0 && (
            <li className="col-span-full">
              <EmptyState
                icon={<Wrench className="h-6 w-6" aria-hidden />}
                title="Divisions coming soon"
                message="The seven technical divisions will be listed here."
              />
            </li>
          )}
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-ink py-16 text-white md:py-20">
        <div className="container-page grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
            <Users className="h-8 w-8 text-accent" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">Join the institution</h2>
            <p className="mt-2 text-sm text-primary-foreground/85">
              Create your member account to vote in chapter elections, verify your dues status and stay
              in the loop across every session.
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <Button variant="accent">Create member account</Button>
            </Link>
          </div>
          <div className="rounded-2xl bg-secondary p-8 text-secondary-foreground">
            <Wrench className="h-8 w-8 text-accent" aria-hidden />
            <h2 className="mt-4 text-2xl font-bold">Alumni & industry</h2>
            <p className="mt-2 text-sm text-secondary-foreground/90">
              Great Ife engineers, come home. Register on the alumni roll, mentor a student, sponsor a
              project or partner with the chapter.
            </p>
            <Link href="/alumni" className="mt-6 inline-block">
              <Button variant="accent">Register as alumni</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
