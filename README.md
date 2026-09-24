# NIMechE OAU-SC Website

The official website and admin dashboard for the **Nigerian Institution of Mechanical Engineers — Obafemi Awolowo University Students' Chapter** (Mechanical Engineering Department, OAU).

Built with **Next.js 15 (App Router) · TypeScript · Tailwind CSS · Firebase (Auth + Firestore) · Cloudinary**. It replaces the legacy WordPress site with a custom app whose content is managed entirely through a zero-code admin dashboard, so future (non-technical) administrations can run it without touching code.

---

## What's included

**Public site** — Home, About (mission/vision/values, history, constitution), Executive Council (current + past-administrations archive), Achievements, Department Showcase, the seven Technical Divisions, Committees, Projects & Innovation Hub, Conference & Exhibition Hub, Design & Innovation Challenge, Opportunities Portal, Resource Center, News, Gallery, Alumni & Industry, and Contact.

**Elections** — A complete Nigerian-university-style voting system: an admin creates an election per session, adds positions (President, Gen. Sec., etc.), then adds candidates with Cloudinary portraits, level, matric number, slogan, manifesto and social links. Voting enforces **one vote per voter per position**, supports optional **fee-verification gating**, **live results**, **published results**, automatic open/close from a scheduled window, and a permanent **archive** of past sessions.

**Admin dashboard** — A single generic CMS engine drives every content module (news, events, projects, opportunities, resources, executives, divisions, committees, achievements, gallery, showcase), plus elections, fee verification (manual add + CSV bulk import), the contact/alumni inbox, user & role management, and global site settings.

**Accessibility** — Skip link, focus-trapped modals, ARIA throughout, and an A11y panel (font scale 100–150%, high contrast, underline links, reduced motion) persisted per visitor.

**Roles** — `super_admin` › `admin` › `editor` › `member`. Editors can create drafts only; admins publish/edit/delete; super admins also manage users, elections and fees.