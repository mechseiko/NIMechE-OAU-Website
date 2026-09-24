"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, ShieldCheck, UserRound, X, Vote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { logoutAccount } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface NavGroup {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

const NAV: NavGroup[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "Mission, Vision & Values", href: "/about" },
      { label: "History & Legacy", href: "/about#history" },
      { label: "Constitution & Bye-Laws", href: "/about#constitution" },
      { label: "Executive Council", href: "/executives" },
      { label: "Achievements", href: "/achievements" },
      { label: "Department Showcase", href: "/department" },
    ],
  },
  {
    label: "Divisions",
    children: [
      { label: "Technical Divisions", href: "/technical-divisions" },
      { label: "Committees", href: "/committees" },
    ],
  },
  {
    label: "Hubs",
    children: [
      { label: "Projects & Innovation", href: "/projects" },
      { label: "Conference & Exhibition", href: "/conference" },
      { label: "Design & Innovation Challenge", href: "/challenge" },
      { label: "Opportunities Portal", href: "/opportunities" },
      { label: "Resource Center", href: "/resources" },
    ],
  },
  {
    label: "Community",
    children: [
      { label: "News & Announcements", href: "/news" },
      { label: "Gallery", href: "/gallery" },
      { label: "Alumni & Industry", href: "/alumni" },
      { label: "Contact", href: "/contact" },
    ],
  },
  { label: "Elections", href: "/elections" },
];

export function Navbar() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
        setUserMenuOpen(false);
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenGroup(null);
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur no-print">
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex h-9 items-center justify-between text-[11px] font-medium">
          <p className="truncate">Nigerian Institution of Mechanical Engineers · OAU Students&apos; Chapter</p>
          <p className="hidden items-center gap-1 sm:flex">
            <Vote className="h-3 w-3" aria-hidden />
            Manufacturing for man&apos;s comfort
          </p>
        </div>
      </div>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="NIMechE OAU home">
          <Image
            src="/images/logo-nimeche.jpg"
            alt="NIMechE logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-accent"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-ink">NIMechE</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
              OAU-SC · Great Ife
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((group) =>
            group.children ? (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  aria-expanded={openGroup === group.label}
                  aria-haspopup="true"
                  onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    openGroup === group.label ? "bg-primary-soft text-primary" : "text-ink-soft hover:text-primary",
                  )}
                >
                  {group.label}
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                </button>
                {openGroup === group.label && (
                  <div className="absolute left-0 top-full w-60 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lift animate-fade-up">
                    {group.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-ink-soft hover:bg-primary-soft hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={group.label}
                href={group.href!}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  pathname === group.href ? "bg-primary-soft text-primary" : "text-ink-soft hover:text-primary",
                )}
                aria-current={pathname === group.href ? "page" : undefined}
              >
                {group.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                type="button"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-surface-subtle"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {(profile?.displayName ?? "M").slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-[110px] truncate sm:block">
                  {profile?.displayName ?? "Member"}
                </span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lift animate-fade-up">
                  <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-primary-soft hover:text-primary">
                    <UserRound className="h-4 w-4" aria-hidden /> My dashboard
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-primary-soft hover:text-primary">
                      <ShieldCheck className="h-4 w-4" aria-hidden /> Admin dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => void logoutAccount()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger hover:bg-danger-soft"
                  >
                    <LogOut className="h-4 w-4" aria-hidden /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">Become a member</Button>
              </Link>
            </div>
          )}
          <button
            type="button"
            className="rounded-lg border border-line p-2 text-ink lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobile" className="border-t border-line bg-surface lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((group) =>
              group.children ? (
                <details key={group.label} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-subtle">
                    {group.label}
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="ml-3 border-l-2 border-line pl-3">
                    {group.children.map((child) => (
                      <Link key={child.href} href={child.href} className="block rounded-lg px-3 py-2 text-sm text-ink-muted hover:text-primary">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link key={group.label} href={group.href!} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-subtle">
                  {group.label}
                </Link>
              ),
            )}
            {!user && (
              <div className="mt-2 flex gap-2 border-t border-line pt-3">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Sign in</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button className="w-full">Join</Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
