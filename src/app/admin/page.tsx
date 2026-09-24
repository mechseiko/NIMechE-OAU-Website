"use client";

import Link from "next/link";
import {
  CalendarDays,
  Contact,
  FileText,
  Lightbulb,
  Mail,
  Newspaper,
  Users,
  Vote,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { effectiveStatus } from "@/lib/elections";
import { formatDateTime } from "@/lib/utils";
import {
  ELECTION_STATUS_LABELS,
  type ContactSubmission,
  type Election,
  type EventItem,
  type NewsPost,
  type Project,
} from "@/types";

export default function AdminOverview() {
  const { profile } = useAuth();
  const { data: news } = useCollection<NewsPost>(COL.news);
  const { data: events } = useCollection<EventItem>(COL.events);
  const { data: projects } = useCollection<Project>(COL.projects);
  const { data: contacts } = useCollection<ContactSubmission>(COL.contacts);
  const { data: elections } = useCollection<Election>(COL.elections);
  const { data: users } = useCollection<{ id: string }>(COL.users);

  const unread = contacts.filter((c) => !c.read).length;
  const activeElection = elections.find((e) => effectiveStatus(e) === "active");

  const stats = [
    { label: "Published news", value: news.filter((n) => n.published).length, icon: <Newspaper className="h-5 w-5" aria-hidden />, href: "/admin/news" },
    { label: "Events", value: events.length, icon: <CalendarDays className="h-5 w-5" aria-hidden />, href: "/admin/events" },
    { label: "Projects", value: projects.length, icon: <Lightbulb className="h-5 w-5" aria-hidden />, href: "/admin/projects" },
    { label: "Members", value: users.length, icon: <Users className="h-5 w-5" aria-hidden />, href: "/admin/users" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Welcome back, {profile?.displayName}</h1>
        <p className="mt-1 text-sm text-ink-muted">Here's what's happening across the chapter website.</p>
      </header>

      {activeElection && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-secondary bg-secondary-soft p-5">
          <div className="flex items-center gap-3">
            <Vote className="h-6 w-6 text-secondary" aria-hidden />
            <div>
              <p className="font-bold text-ink">{activeElection.title} is live</p>
              <p className="text-xs text-ink-muted">
                Closes {formatDateTime(activeElection.endsAt)} · {ELECTION_STATUS_LABELS[effectiveStatus(activeElection)]}
              </p>
            </div>
          </div>
          <Link href={`/admin/elections/${activeElection.id}`}>
            <Button variant="secondary" size="sm">Manage election</Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card flex items-center gap-4 p-5 transition-shadow hover:shadow-lift">
            <span className="rounded-xl bg-primary-soft p-3 text-primary">{stat.icon}</span>
            <div>
              <p className="font-display text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="card p-5" aria-labelledby="inbox-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="inbox-heading" className="flex items-center gap-2 font-display text-lg font-bold">
            <Mail className="h-5 w-5 text-secondary" aria-hidden /> Latest messages
            {unread > 0 && <Badge tone="danger">{unread} unread</Badge>}
          </h2>
          <Link href="/admin/contacts">
            <Button variant="outline" size="sm">Open inbox</Button>
          </Link>
        </div>
        {contacts.length === 0 ? (
          <p className="text-sm text-ink-muted">No messages yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {[...contacts]
              .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
              .slice(0, 5)
              .map((contact) => (
                <li key={contact.id} className="flex items-start gap-3 py-3">
                  <Contact className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {contact.subject} {!contact.read && <span className="ml-1 inline-block h-2 w-2 rounded-full bg-secondary" aria-label="unread" />}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {contact.name} · {contact.email} · {formatDateTime(contact.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="card bg-surface-subtle p-5" aria-labelledby="handover-heading">
        <h2 id="handover-heading" className="mb-2 flex items-center gap-2 font-display text-base font-bold">
          <FileText className="h-4 w-4 text-secondary" aria-hidden /> Handover checklist for the next administration
        </h2>
        <ul className="space-y-1 text-sm text-ink-soft">
          <li>· Create next session's election early (draft), add positions & candidates, then schedule it.</li>
          <li>· Archive the outgoing executive council by switching their profiles to “past”.</li>
          <li>· Import the new session's dues list under Fee Verification before polls open.</li>
          <li>· Update Site Settings: administration year, hero text and announcement bar.</li>
        </ul>
      </section>
    </div>
  );
}
