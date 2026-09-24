import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatDate, truncate } from "@/lib/utils";

interface ListingCardProps {
  href?: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  badge?: string;
  badgeTone?: "primary" | "secondary" | "accent" | "danger" | "success" | "neutral";
  meta?: ReactNode[];
  footer?: ReactNode;
}

/** The single shared card used across news, projects, opportunities,
 *  resources, achievements and events — props-driven, never duplicated. */
export function ListingCard({
  href,
  title,
  description,
  imageUrl,
  imageAlt,
  badge,
  badgeTone = "primary",
  meta = [],
  footer,
}: ListingCardProps) {
  const body = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-sunken">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="gear-pattern flex h-full w-full items-center justify-center bg-primary">
            <span className="font-display text-3xl font-bold text-primary-foreground/70">
              {title.slice(0, 1)}
            </span>
          </div>
        )}
        {badge && (
          <span className="absolute left-3 top-3">
            <Badge tone={badgeTone}>{badge}</Badge>
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-bold text-ink line-clamp-2 group-hover:text-primary">
          {title}
        </h3>
        <p className="text-sm text-ink-muted line-clamp-3">{truncate(description, 180)}</p>
        {meta.length > 0 && (
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-muted">
            {meta.map((item, index) => (
              <span key={index} className="inline-flex items-center gap-1">
                {item}
              </span>
            ))}
          </div>
        )}
        {footer}
      </div>
    </>
  );

  const classes =
    "card group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lift focus-within:ring-2 focus-within:ring-secondary";

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={title}>
        {body}
      </Link>
    );
  }
  return <article className={classes}>{body}</article>;
}

export function MetaCalendar({ date }: { date?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
      {formatDate(date)}
    </span>
  );
}

export function MetaLocation({ location }: { location?: string }) {
  if (!location) return null;
  return (
    <span className="inline-flex items-center gap-1">
      <MapPin className="h-3.5 w-3.5" aria-hidden />
      {location}
    </span>
  );
}

export function ReadMore() {
  return (
    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
      Read more
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
    </span>
  );
}
