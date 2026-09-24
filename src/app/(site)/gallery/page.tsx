"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { IconButton } from "@/components/ui/Button";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { GALLERY_LABELS, type GalleryItem } from "@/types";

export default function GalleryPage() {
  const { data: gallery, loading } = useCollection<GalleryItem>(COL.gallery);
  const [category, setCategory] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = category === "all" ? gallery : gallery.filter((g) => g.category === category);
    return [...list].sort((a, b) => (b.takenAt ?? "").localeCompare(a.takenAt ?? ""));
  }, [gallery, category]);

  const current = lightbox !== null ? filtered[lightbox] : null;

  return (
    <>
      <PageHeader
        kicker="Gallery & media"
        title="The chapter in pictures"
        description="Events, industry visits, projects, department life and achievements — captured across sessions."
      />
      <section className="container-page py-12 md:py-16">
        <Tabs
          className="mb-8 max-w-4xl"
          active={category}
          onChange={setCategory}
          items={[
            { id: "all", label: "All photos", count: gallery.length },
            ...Object.entries(GALLERY_LABELS).map(([id, label]) => ({
              id,
              label,
              count: gallery.filter((g) => g.category === id).length,
            })),
          ]}
        />
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Camera className="h-6 w-6" aria-hidden />} title="No photos in this category yet" />
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((photo, index) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setLightbox(index)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-secondary"
                  aria-label={`View photo: ${photo.title}`}
                >
                  <Image
                    src={photo.imageUrl}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="block truncate text-xs font-semibold text-white">{photo.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.title} className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/90 p-4">
          <button type="button" className="absolute inset-0" aria-label="Close photo viewer" onClick={() => setLightbox(null)} />
          <figure className="relative max-h-full max-w-4xl">
            <Image
              src={current.imageUrl}
              alt={current.alt}
              width={1200}
              height={800}
              className="max-h-[78vh] w-auto rounded-xl object-contain"
              sizes="90vw"
            />
            <figcaption className="mt-3 text-center text-sm text-white">
              <span className="font-semibold">{current.title}</span>
              {current.takenAt && <span className="text-white/70"> · {formatDate(current.takenAt)}</span>}
            </figcaption>
          </figure>
          <div className="absolute right-4 top-4 flex gap-2">
            <IconButton label="Previous photo" variant="outline" onClick={() => setLightbox((lightbox! - 1 + filtered.length) % filtered.length)}>
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </IconButton>
            <IconButton label="Next photo" variant="outline" onClick={() => setLightbox((lightbox! + 1) % filtered.length)}>
              <ChevronRight className="h-5 w-5" aria-hidden />
            </IconButton>
            <IconButton label="Close photo viewer" variant="outline" onClick={() => setLightbox(null)}>
              <X className="h-5 w-5" aria-hidden />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
}
