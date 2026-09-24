"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, Eye, FileText, HeartHandshake, ScrollText, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader, SectionHeading } from "@/components/ui/Feedback";
import { useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { SiteSettings } from "@/types";

const DEFAULT_VALUES = [
  "Professionalism — we hold ourselves to the standards of the engineering profession.",
  "Innovation — we build, prototype and solve real problems from Great Ife.",
  "Brotherhood — one chapter, one family, across sessions and generations.",
  "Service — engineering knowledge deployed for man's comfort.",
  "Excellence — we compete, we research, we represent.",
];

export default function AboutPage() {
  const { data: settings } = useDoc<SiteSettings>(COL.settings, "site");

  return (
    <>
      <PageHeader
        kicker="About us"
        title="The institution behind the engineers of Great Ife"
        description="NIMechE OAU Students' Chapter is the professional home of every Mechanical Engineering student at Obafemi Awolowo University — the bridge between the lecture theatre and the profession."
      />

      <section className="container-page grid gap-6 py-16 md:grid-cols-3" aria-label="Mission, vision and values">
        <article className="card p-6">
          <span className="mb-4 inline-flex rounded-xl bg-primary-soft p-3 text-primary">
            <Target className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-lg font-bold">Our Mission</h2>
          <p className="prose-body mt-2 text-sm">
            {settings?.aboutMission ??
              "To unite Mechanical Engineering students of Obafemi Awolowo University under one professional body, develop their technical and leadership capacity, and represent their interests within the department, the university and the national institution."}
          </p>
        </article>
        <article className="card p-6">
          <span className="mb-4 inline-flex rounded-xl bg-secondary-soft p-3 text-secondary">
            <Eye className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-lg font-bold">Our Vision</h2>
          <p className="prose-body mt-2 text-sm">
            {settings?.aboutVision ??
              "A chapter where every student engineer graduates not only with a degree but with a portfolio, a network and the character to manufacture comfort for mankind."}
          </p>
        </article>
        <article className="card p-6">
          <span className="mb-4 inline-flex rounded-xl bg-accent-soft p-3 text-accent-dark">
            <HeartHandshake className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="text-lg font-bold">Core Values</h2>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">
            {(settings?.values?.length ? settings.values : DEFAULT_VALUES).map((value) => (
              <li key={value} className="flex items-start gap-2">
                <Compass className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                {value}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section id="history" className="bg-surface-subtle py-16 md:py-20" aria-labelledby="history-heading">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              kicker="History & legacy"
              title="From MESA to NIMechE"
              description="Decades of student engineering leadership at Obafemi Awolowo University."
            />
            <p className="prose-body text-sm md:text-base">
              {settings?.historyText ??
                `Long before the current name, Mechanical Engineering students of Obafemi Awolowo University organised themselves as the Mechanical Engineering Students' Association (MESA) — a departmental family that ran technical nights, inter-session competitions and welfare schemes.\n\nAs the national body matured into the Nigerian Institution of Mechanical Engineers (NIMechE), the chapter re-registered as the NIMechE OAU Students' Chapter, aligning student activity with the professional institution: technical divisions, conferences, design challenges and a seat at the national table.\n\nToday the chapter runs seven technical divisions, an annual conference and exhibition, the Design & Innovation Challenge, industrial trips across Nigeria and beyond, and yearly democratic elections that hand the baton from one administration to the next.`}
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <Image
              src="/images/logo-nimeche.jpg"
              alt="NIMechE emblem"
              width={420}
              height={420}
              className="w-full rounded-3xl object-cover shadow-lift ring-4 ring-accent"
            />
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-primary px-5 py-3 text-primary-foreground shadow-lift">
              <p className="font-display text-lg font-bold">Est. Great Ife</p>
              <p className="text-xs text-primary-foreground/80">MESA → NIMechE OAU-SC</p>
            </div>
          </div>
        </div>
      </section>

      <section id="constitution" className="container-page py-16 md:py-20" aria-labelledby="constitution-heading">
        <SectionHeading
          kicker="Governance"
          title="Constitution & bye-laws"
          description="The chapter is governed by a constitution that defines offices, elections, finance and discipline — reviewed by each administration and ratified by the general congress."
        />
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-primary-soft p-3 text-primary">
              <ScrollText className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-bold text-ink">Chapter Constitution</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Read the full constitution and bye-laws, or request a copy from the General Secretary.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {settings?.constitutionUrl && (
              <a href={settings.constitutionUrl} target="_blank" rel="noopener noreferrer">
                <Button>
                  <FileText className="h-4 w-4" aria-hidden /> Open document
                </Button>
              </a>
            )}
            <Link href="/resources">
              <Button variant="outline">Resource center</Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
