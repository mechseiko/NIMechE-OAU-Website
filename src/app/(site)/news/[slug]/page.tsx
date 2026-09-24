"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useCollection } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { NewsPost } from "@/types";

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: news, loading } = useCollection<NewsPost>(COL.news);

  const post = news.find((item) => (item.slug ?? item.id) === slug);

  if (loading) return <Spinner label="Loading article" />;
  if (!post || !post.published)
    return (
      <div className="container-page py-20">
        <EmptyState
          title="Article not found"
          message="This story may have been unpublished or moved."
          action={
            <Link href="/news">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" aria-hidden /> All news
              </Button>
            </Link>
          }
        />
      </div>
    );

  return (
    <article className="container-page max-w-3xl py-12 md:py-16">
      <Link href="/news" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Newsroom
      </Link>
      <Badge tone="primary">{post.category}</Badge>
      <h1 className="mt-3 text-3xl font-bold text-balance md:text-4xl">{post.title}</h1>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden /> {formatDate(post.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="h-4 w-4" aria-hidden /> {post.author}
        </span>
      </div>
      {post.coverUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl shadow-card">
          <Image src={post.coverUrl} alt={post.coverAlt || post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
        </div>
      )}
      <p className="mt-8 text-base font-semibold leading-relaxed text-ink">{post.excerpt}</p>
      <div className="prose-body mt-4 text-sm md:text-base">{post.body}</div>
    </article>
  );
}
