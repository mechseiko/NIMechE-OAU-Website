"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { EmptyState, PageHeader } from "@/components/ui/Feedback";
import { useToast } from "@/context/ToastProvider";
import { useDoc } from "@/hooks/useCollection";
import { COL, createDoc } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";
import { errorMessage, nowIso } from "@/lib/utils";
import { contactSchema, type ContactInput } from "@/lib/validation";
import type { SiteSettings } from "@/types";

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: "general", website: "" },
  });
  const { toast } = useToast();
  const { data: settings } = useDoc<SiteSettings>(COL.settings, "site");
  const [done, setDone] = useState(false);

  async function onSubmit(input: ContactInput) {
    if (input.website) return; // honeypot
    try {
      await createDoc(COL.contacts, {
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        type: input.type,
        read: false,
        createdAt: nowIso(),
      });
      setDone(true);
      reset({ type: "general", website: "" });
      toast("Message delivered to the Executive Council.");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  return (
    <>
      <PageHeader
        kicker="Contact hub"
        title="Talk to the council"
        description="Questions, partnerships, alumni enquiries or media — the Executive Council reads everything that lands here."
      />
      <section className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {done ? (
            <EmptyState
              icon={<Send className="h-6 w-6" aria-hidden />}
              title="Message sent!"
              message="An executive will respond to your email as soon as possible — usually within 48 hours."
              action={<Button variant="outline" onClick={() => setDone(false)}>Send another message</Button>}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-6 sm:grid-cols-2" noValidate>
              <Input label="Your name" required placeholder="Full name" error={errors.name?.message} {...register("name")} />
              <Input label="Email" type="email" required placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
              <Select
                label="Enquiry type"
                options={[
                  { value: "general", label: "General enquiry" },
                  { value: "alumni", label: "Alumni enquiry" },
                  { value: "industry", label: "Industry / partnership" },
                ]}
                {...register("type")}
              />
              <Input label="Subject" required placeholder="How can we help?" error={errors.subject?.message} {...register("subject")} />
              <div className="sm:col-span-2">
                <Textarea label="Message" required rows={6} placeholder="Write your message…" error={errors.message?.message} {...register("message")} />
              </div>
              {/* honeypot — hidden from humans, traps bots */}
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" placeholder="Leave this field empty" {...register("website")} />
              <div className="sm:col-span-2">
                <Button type="submit" loading={isSubmitting} disabled={!isFirebaseConfigured}>
                  <Send className="h-4 w-4" aria-hidden /> Send message
                </Button>
                {!isFirebaseConfigured && (
                  <p className="mt-2 text-xs text-danger">Firebase is not configured yet — the form activates once env vars are added.</p>
                )}
              </div>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Chapter office</h2>
            <ul className="space-y-3 text-sm text-ink-soft">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                {settings?.contactAddress ?? "Department of Mechanical Engineering, Obafemi Awolowo University, Ile-Ife, Osun State, Nigeria"}
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                <a className="hover:text-primary" href={`mailto:${settings?.contactEmail ?? "nimecheoau18@gmail.com"}`}>
                  {settings?.contactEmail ?? "nimecheoau18@gmail.com"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                <a className="hover:text-primary" href={`tel:${settings?.contactPhone ?? "07039607106"}`}>
                  {settings?.contactPhone ?? "07039607106"}
                </a>
              </li>
            </ul>
          </div>
          <div className="card bg-surface-subtle p-6">
            <h2 className="mb-2 font-display text-base font-bold">Office hours</h2>
            <p className="text-sm text-ink-soft">
              The chapter office runs during the academic session, Monday to Friday. Urgent matters reach
              the General Secretary fastest by phone.
            </p>
          </div>
          {settings?.socials && settings.socials.length > 0 && (
            <div className="card p-6">
              <h2 className="mb-3 font-display text-base font-bold">Follow the chapter</h2>
              <div className="flex flex-wrap gap-2">
                {settings.socials.map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-secondary hover:text-secondary">
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
