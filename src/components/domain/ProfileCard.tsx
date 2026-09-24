import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { initials } from "@/lib/utils";

interface ProfileCardProps {
  name: string;
  role: string;
  photoUrl?: string;
  photoAlt?: string;
  email?: string;
  phone?: string;
  subtitle?: string;
  message?: string;
}

/** Shared profile template: executives (current + past), speakers, candidates. */
export function ProfileCard({ name, role, photoUrl, photoAlt, email, phone, subtitle, message }: ProfileCardProps) {
  return (
    <article className="card flex h-full flex-col items-center gap-3 overflow-hidden p-5 text-center transition-shadow hover:shadow-lift">
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-accent/60 bg-primary-soft">
        {photoUrl ? (
          <Image src={photoUrl} alt={photoAlt || name} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-primary font-display text-2xl font-bold text-primary-foreground">
            {initials(name)}
          </span>
        )}
      </div>
      <div>
        <h3 className="font-display text-base font-bold text-ink">{name}</h3>
        <p className="text-sm font-semibold text-secondary">{role}</p>
        {subtitle && <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
      </div>
      {message && <p className="text-xs italic text-ink-muted line-clamp-3">“{message}”</p>}
      {(email || phone) && (
        <div className="mt-auto flex flex-col gap-1 pt-1 text-xs text-ink-muted">
          {email && (
            <a href={`mailto:${email}`} className="inline-flex items-center justify-center gap-1 hover:text-primary">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {email}
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="inline-flex items-center justify-center gap-1 hover:text-primary">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              {phone}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
