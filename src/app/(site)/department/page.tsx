"use client";

import { useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import { EmptyState, PageHeader, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { GALLERY_LABELS, SHOWCASE_LABELS, type GalleryItem, type ShowcaseItem } from "@/types";
import Image from "next/image";

export default function DepartmentPage() {
  const { data: showcase, loading } = useCollection<ShowcaseItem>(COL.showcase);
  const { data: gallery } = useCollection<GalleryItem>(COL.gallery);
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () => (category === "all" ? showcase : showcase.filter((item) => item.category === category)),
    [showcase, category],
  );
  const photos = gallery.filter((item) => item.category === "department").slice(0, 8);

  return (
    <>
      <PageHeader
        kicker="Department of Mechanical Engineering"
        title="Our home: workshops, labs and lecture theatres"
        description="A showcase of the facilities, laboratories, culture and programmes that shape a Great Ife mechanical engineer."
      />

      <section className="container-page py-12 md:py-16">
        <SectionHeading kicker="Showcase" title="Facilities, labs & culture" />
        <Tabs
          className="mb-8 max-w-3xl"
          active={category}
          onChange={setCategory}
          items={[
            { id: "all", label: "Everything", count: showcase.length },
            ...Object.entries(SHOWCASE_LABELS).map(([id, label]) => ({
              id,
              label,
              count: showcase.filter((s) => s.category === id).length,
            })),
          ]}
        />
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-6 w-6" aria-hidden />}
            title="Showcase coming soon"
            message="Department facilities and laboratories will be documented here."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item.id} className="card overflow-hidden">
                {item.imageUrl && (
                  <div className="relative aspect-[16/9]">
                    <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">
                    {SHOWCASE_LABELS[item.category]}
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-surface-subtle py-16" aria-label="Department photo gallery">
        <div className="container-page">
          <SectionHeading kicker="Media" title="Life in the department" />
          {photos.length === 0 ? (
            <EmptyState title="No department photos yet" message={`Photos tagged “${GALLERY_LABELS.department}” will appear here.`} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl">
                  <Image src={photo.imageUrl} alt={photo.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
