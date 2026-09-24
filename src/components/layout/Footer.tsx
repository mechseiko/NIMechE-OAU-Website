import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useDoc } from "@/hooks/useCollection";
import { COL } from "@/lib/db";
import type { SiteSettings } from "@/types";

const QUICK_LINKS = [
  { label: "About the Chapter", href: "/about" },
  { label: "Executive Council", href: "/executives" },
  { label: "Technical Divisions", href: "/technical-divisions" },
  { label: "Projects & Innovation", href: "/projects" },
  { label: "Opportunities Portal", href: "/opportunities" },
  { label: "Elections & Voting", href: "/elections" },
];

const RESOURCE_LINKS = [
  { label: "News & Announcements", href: "/news" },
  { label: "Conference & Exhibition", href: "/conference" },
  { label: "Resource Center", href: "/resources" },
  { label: "Gallery", href: "/gallery" },
  { label: "Alumni Registration", href: "/alumni" },
  { label: "Contact Us", href: "/contact" },
];

export function Footer() {
  const { data: settings } = useDoc<SiteSettings>(COL.settings, "site");

  return (
    <footer className="mt-auto bg-ink text-white/80 no-print">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-nimeche.jpg"
              alt="NIMechE logo"
              width={52}
              height={52}
              className="h-13 w-13 rounded-full object-cover ring-2 ring-accent"
            />
            <div>
              <p className="font-display text-lg font-bold text-white">NIMechE OAU-SC</p>
              <p className="text-xs uppercase tracking-widest text-accent">Manufacturing for man&apos;s comfort</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            The Nigerian Institution of Mechanical Engineers, Obafemi Awolowo University Students&apos;
            Chapter — building engineers, leaders and innovators from Great Ife since the MESA days.
          </p>
          <div className="flex items-center gap-2">
            <Image src="/images/logo-oau.jpg" alt="Obafemi Awolowo University crest" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
            <span className="text-xs text-white/60">For Learning and Culture</span>
          </div>
        </div>

        <nav aria-label="Quick links">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">Explore</h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Resources">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">Resources</h3>
          <ul className="space-y-2 text-sm">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-accent">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
              <span>{settings?.contactAddress ?? "Department of Mechanical Engineering, Obafemi Awolowo University, Ile-Ife, Osun State"}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
              <a href={`mailto:${settings?.contactEmail ?? "nimecheoau18@gmail.com"}`} className="hover:text-accent">
                {settings?.contactEmail ?? "nimecheoau18@gmail.com"}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
              <a href={`tel:${settings?.contactPhone ?? "07039607106"}`} className="hover:text-accent">
                {settings?.contactPhone ?? "07039607106"}
              </a>
            </li>
          </ul>
          {settings?.socials && settings.socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {settings.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-accent hover:text-accent"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} NIMechE OAU Students&apos; Chapter. All rights reserved.
          </p>
          <p>
            Built with pride by the chapter&apos;s development team ·{" "}
            <Link href="/admin" className="hover:text-accent">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
