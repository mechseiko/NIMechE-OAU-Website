"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Input, Switch, Textarea } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Feedback";
import { useToast } from "@/context/ToastProvider";
import { useDoc } from "@/hooks/useCollection";
import { COL, setDocAt } from "@/lib/db";
import { errorMessage } from "@/lib/utils";
import type { SiteSettings } from "@/types";

const DEFAULTS: SiteSettings = {
  id: "site",
  siteName: "NIMechE OAU-SC",
  tagline: "Nigerian Institution of Mechanical Engineers — OAU Students' Chapter",
  heroTitle: "Building the next generation of mechanical engineers",
  heroSubtitle:
    "The students' chapter of the Nigerian Institution of Mechanical Engineers at Obafemi Awolowo University — engineering excellence, professional growth and community.",
  announcement: "",
  announcementActive: false,
  aboutMission: "",
  aboutVision: "",
  values: [],
  historyText: "",
  constitutionUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  socials: [],
  currentAdministration: "",
  stats: [],
};

export default function AdminSettingsPage() {
  const { data, loading } = useDoc<SiteSettings>(COL.settings, "site");
  const { toast } = useToast();
  const [form, setForm] = useState<SiteSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (data && !hydrated) {
      setForm({ ...DEFAULTS, ...data });
      setHydrated(true);
    }
  }, [data, hydrated]);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    if (!form.siteName.trim()) {
      toast("Site name is required.", "error");
      return;
    }
    setSaving(true);
    try {
      await setDocAt(COL.settings, "site", {
        ...form,
        id: "site",
        values: form.values.filter((v) => v.trim()),
        socials: form.socials.filter((s) => s.label.trim() || s.url.trim()),
        stats: form.stats.filter((s) => s.label.trim() || s.value.trim()),
      } as never);
      toast("Site settings saved.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Spinner label="Loading settings" />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Site settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">
            Global content that drives the homepage, about page, footer and contact details across the whole website.
          </p>
        </div>
        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </header>

      <Section title="Identity">
        <Input label="Site name" required value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
        <Input label="Tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        <Input
          label="Current administration"
          value={form.currentAdministration}
          onChange={(e) => set("currentAdministration", e.target.value)}
          hint="e.g. 2025/2026 Executive Council"
        />
      </Section>

      <Section title="Homepage hero">
        <Input label="Hero title" value={form.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />
        <Textarea label="Hero subtitle" rows={3} value={form.heroSubtitle} onChange={(e) => set("heroSubtitle", e.target.value)} />
        <Input label="Announcement bar text" value={form.announcement ?? ""} onChange={(e) => set("announcement", e.target.value)} />
        <Switch
          id="announcement-active"
          label="Show announcement bar"
          checked={Boolean(form.announcementActive)}
          onChange={(v) => set("announcementActive", v)}
        />
        <RowsEditor
          label="Key metrics"
          addLabel="Add metric"
          fields={[
            { key: "label", placeholder: "e.g. Members" },
            { key: "value", placeholder: "e.g. 500+" },
          ]}
          value={form.stats as { label: string; value: string }[]}
          onChange={(rows) => set("stats", rows as SiteSettings["stats"])}
        />
      </Section>

      <Section title="About the chapter">
        <Textarea label="Mission" rows={3} value={form.aboutMission} onChange={(e) => set("aboutMission", e.target.value)} />
        <Textarea label="Vision" rows={3} value={form.aboutVision} onChange={(e) => set("aboutVision", e.target.value)} />
        <ListEditor label="Core values" value={form.values} onChange={(v) => set("values", v)} />
        <Textarea
          label="History & legacy (MESA → NIMechE)"
          rows={6}
          value={form.historyText}
          onChange={(e) => set("historyText", e.target.value)}
        />
        <Input
          label="Constitution & bye-laws URL"
          value={form.constitutionUrl ?? ""}
          onChange={(e) => set("constitutionUrl", e.target.value)}
          placeholder="https://…"
        />
      </Section>

      <Section title="Contact">
        <Input label="Contact email" type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        <Input label="Contact phone" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
        <Textarea label="Contact address" rows={2} value={form.contactAddress} onChange={(e) => set("contactAddress", e.target.value)} />
        <RowsEditor
          label="Social links"
          addLabel="Add social"
          fields={[
            { key: "label", placeholder: "e.g. Instagram" },
            { key: "url", placeholder: "https://…" },
          ]}
          value={form.socials}
          onChange={(rows) => set("socials", rows as SiteSettings["socials"])}
        />
      </Section>

      <div className="flex justify-end">
        <Button onClick={save} loading={saving}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-muted">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function ListEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 sm:col-span-2">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            aria-label={`${label} ${i + 1}`}
            value={item}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <IconButton label={`Remove ${label} ${i + 1}`} variant="outline" onClick={() => onChange(value.filter((_, x) => x !== i))}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ))}
      <Button variant="outline" size="sm" className="self-start" onClick={() => onChange([...value, ""])}>
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add value
      </Button>
    </fieldset>
  );
}

function RowsEditor({
  label,
  addLabel,
  fields,
  value,
  onChange,
}: {
  label: string;
  addLabel: string;
  fields: { key: string; placeholder?: string }[];
  value: Record<string, string>[];
  onChange: (rows: Record<string, string>[]) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-2 sm:col-span-2">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {value.map((row, i) => (
        <div key={i} className="flex gap-2">
          {fields.map((f) => (
            <Input
              key={f.key}
              aria-label={`${label} ${f.key} ${i + 1}`}
              className="flex-1"
              placeholder={f.placeholder}
              value={row[f.key] ?? ""}
              onChange={(e) => {
                const next = [...value];
                next[i] = { ...next[i], [f.key]: e.target.value };
                onChange(next);
              }}
            />
          ))}
          <IconButton label={`Remove ${label} ${i + 1}`} variant="outline" onClick={() => onChange(value.filter((_, x) => x !== i))}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => onChange([...value, Object.fromEntries(fields.map((f) => [f.key, ""]))])}
      >
        <Plus className="h-3.5 w-3.5" aria-hidden /> {addLabel}
      </Button>
    </fieldset>
  );
}
