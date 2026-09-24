"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  CalendarDays,
  Contact,
  FileText,
  GraduationCap,
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
  Vote,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { logoutAccount } from "@/lib/auth";
import { cn, ROLE_LABELS } from "./admin-utils";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  superOnly?: boolean;
}

const GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" aria-hidden /> }],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/news", label: "News", icon: <Newspaper className="h-4 w-4" aria-hidden /> },
      { href: "/admin/events", label: "Events & Conference", icon: <CalendarDays className="h-4 w-4" aria-hidden /> },
      { href: "/admin/projects", label: "Projects", icon: <Lightbulb className="h-4 w-4" aria-hidden /> },
      { href: "/admin/opportunities", label: "Opportunities", icon: <GraduationCap className="h-4 w-4" aria-hidden /> },
      { href: "/admin/resources", label: "Resources", icon: <FileText className="h-4 w-4" aria-hidden /> },
      { href: "/admin/gallery", label: "Gallery", icon: <ImageIcon className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "Chapter",
    items: [
      { href: "/admin/executives", label: "Executives", icon: <Users className="h-4 w-4" aria-hidden /> },
      { href: "/admin/divisions", label: "Technical Divisions", icon: <Landmark className="h-4 w-4" aria-hidden /> },
      { href: "/admin/committees", label: "Committees", icon: <Users className="h-4 w-4" aria-hidden /> },
      { href: "/admin/achievements", label: "Achievements", icon: <Award className="h-4 w-4" aria-hidden /> },
      { href: "/admin/showcase", label: "Dept. Showcase", icon: <Landmark className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "Elections",
    items: [
      { href: "/admin/elections", label: "Elections", icon: <Vote className="h-4 w-4" aria-hidden /> },
      { href: "/admin/fees", label: "Fee Verification", icon: <Wallet className="h-4 w-4" aria-hidden /> },
      { href: "/admin/users", label: "Users & Roles", icon: <ShieldCheck className="h-4 w-4" aria-hidden />, superOnly: true },
    ],
  },
  {
    title: "Inbox",
    items: [
      { href: "/admin/contacts", label: "Messages", icon: <Contact className="h-4 w-4" aria-hidden /> },
      { href: "/admin/alumni", label: "Alumni Sign-ups", icon: <GraduationCap className="h-4 w-4" aria-hidden /> },
    ],
  },
  {
    title: "System",
    items: [{ href: "/admin/settings", label: "Site Settings", icon: <Settings className="h-4 w-4" aria-hidden /> }],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { profile, isSuperAdmin } = useAuth();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <Image src="/images/logo-nimeche.jpg" alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
        <div className="leading-tight">
          <p className="font-display text-sm font-bold text-ink">NIMechE Admin</p>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
            {profile ? ROLE_LABELS[profile.role] : ""}
          </p>
        </div>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => {
          const items = group.items.filter((item) => !item.superOnly || isSuperAdmin);
          if (items.length === 0) return null;
          return (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-ink-soft hover:bg-primary-soft hover:text-primary",
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-line p-3">
        <Link href="/" className="mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-muted hover:bg-surface-subtle hover:text-ink">
          <X className="h-4 w-4 rotate-45" aria-hidden /> View public site
        </Link>
        <button
          type="button"
          onClick={() => void logoutAccount()}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-danger hover:bg-danger-soft"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-surface-subtle">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-line bg-surface lg:block no-print">
        {sidebar}
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden no-print">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setDrawerOpen(false)} aria-hidden />
          <aside className="absolute left-0 top-0 h-full w-72 bg-surface shadow-lift">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:px-6 no-print">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin navigation"
            className="rounded-lg border border-line p-2 text-ink lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <p className="hidden text-sm text-ink-muted lg:block">
            Chapter content management · signed in as{" "}
            <span className="font-semibold text-ink">{profile?.displayName}</span>
          </p>
          <Link href="/elections">
            <Button variant="outline" size="sm">
              <Vote className="h-4 w-4" aria-hidden /> Public elections page
            </Button>
          </Link>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-6 lg:py-8" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
