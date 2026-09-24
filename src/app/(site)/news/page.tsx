"use client";

import { useMemo, useState } from "react";
import { Newspaper, Search } from "lucide-react";
import { EmptyState, PageHeader, Spinner } from "@/components/ui/Feedback";
import { ListingCard } from "@/components/domain/ListingCard";
import { Input } from "@/components/ui/Field";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { NewsPost } from "@/types";

export default function NewsPage() {
  const { data: news, loading } = useCollection<NewsPost>(COL.news);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      news
        .filter((post) => post.published)
        .filter((post) => {
          if (!search.trim()) return true;
          return `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(search.trim().toLowerCase());
        })
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [news, search],
  );

  return (
    <>
      <PageHeader
        kicker="Newsroom"
        title="News & announcements"
        description="Official communiqués, meeting notices, results and stories from the chapter."
      />
      <section className="container-page py-12 md:py-16">
        <div className="relative mb-8 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
          <Input
            aria-label="Search news"
            placeholder="Search announcements…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Newspaper className="h-6 w-6" aria-hidden />} title="No articles found" message="Published announcements will appear here." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <ListingCard
                key={post.id}
                href={`/news/${post.slug ?? post.id}`}
                title={post.title}
                description={post.excerpt}
                imageUrl={post.coverUrl}
                imageAlt={post.coverAlt}
                badge={post.category}
                meta={[formatDate(post.createdAt), post.author]}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
