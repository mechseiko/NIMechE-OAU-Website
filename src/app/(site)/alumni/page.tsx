"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Handshake } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { EmptyState, PageHeader, SectionHeading, Spinner } from "@/components/ui/Feedback";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { COL, createDoc } from "@/lib/db";
import { errorMessage, nowIso } from "@/lib/utils";
import { alumniSchema, type AlumniInput } from "@/lib/validation";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { GalleryItem } from "@/types";

export default function AlumniPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AlumniInput>({
    resolver: zodResolver(alumniSchema),
  });
  const { toast } = useToast();
  const { data: gallery, loading } = useCollection<GalleryItem>(COL.gallery);
  const [done, setDone] = useState(false);

  const visits = gallery.filter((g) => g.category === "industry-visit");

  async function onSubmit(input: AlumniInput) {
    try {
      await createDoc(COL.alumni, { ...input, createdAt: nowIso() });
      setDone(true);
      reset();
      toast("Registration received. Welcome home, alumni!");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  return (
    <>
      <PageHeader
        kicker="Alumni & industry"
        title="Once Great Ife, always Great Ife"
        description="Join the alumni roll, mentor a student, sponsor a project — and browse the chapter's industry visit gallery."
      />

      <section className="container-page grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            kicker="Alumni registration"
            title="Register on the alumni roll"
            description="The roll powers mentorship matching, industry partnerships and the annual alumni homecoming."
          />
          {done ? (
            <EmptyState
              icon={<GraduationCap className="h-6 w-6" aria-hidden />}
              title="Thank you for registering!"
              message="The Public Relations Officer will reach out to confirm your details and add you to the alumni network."
              action={<Button variant="outline" onClick={() => setDone(false)}>Register another alumni</Button>}
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-6 sm:grid-cols-2" noValidate>
              <Input label="Full name" required placeholder="Surname Firstname" error={errors.fullName?.message} {...register("fullName")} />
              <Input label="Email" type="email" required placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
              <Input label="Phone" type="tel" placeholder="0803 000 0000" error={errors.phone?.message} {...register("phone")} />
              <Input label="Matric number" placeholder="EGD/17/1234" error={errors.matricNumber?.message} {...register("matricNumber")} />
              <Input label="Graduation year" placeholder="2019" error={errors.graduationYear?.message} {...register("graduationYear")} />
              <Input label="Current role" placeholder="Maintenance Engineer" error={errors.currentRole?.message} {...register("currentRole")} />
              <Input label="Company / organisation" error={errors.company?.message} {...register("company")} />
              <Input label="Location" placeholder="Lagos, Nigeria" error={errors.location?.message} {...register("location")} />
              <div className="sm:col-span-2">
                <Textarea label="Message to the chapter (optional)" rows={3} error={errors.message?.message} {...register("message")} />
              </div>
              <div className="sm:col-span-2">
                <Button type="submit" loading={isSubmitting} disabled={!isFirebaseConfigured} className="w-full sm:w-auto">
                  Submit registration
                </Button>
                {!isFirebaseConfigured && (
                  <p className="mt-2 text-xs text-danger">Firebase is not configured yet — forms activate once env vars are added.</p>
                )}
              </div>
            </form>
          )}
        </div>

        <div>
          <SectionHeading
            kicker="Industry partnership"
            title="Partner with the chapter"
            description="From factory tours to sponsored projects, industry friends power the chapter's practical exposure."
          />
          <div className="card bg-primary p-6 text-primary-foreground">
            <Handshake className="h-8 w-8 text-accent" aria-hidden />
            <h3 className="mt-3 text-lg font-bold">Ways to partner</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/90">
              <li>· Host an industrial visit or SIWES placement</li>
              <li>· Sponsor the Design & Innovation Challenge or conference</li>
              <li>· Fund a student project from the innovation hub</li>
              <li>· Offer graduate openings through the opportunities portal</li>
            </ul>
            <p className="mt-4 text-sm text-primary-foreground/80">
              Reach the council through the contact page and select “Industry enquiry”.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-surface-subtle py-16" aria-label="Industry visit gallery">
        <div className="container-page">
          <SectionHeading kicker="Gallery" title="Industry visit gallery" description="The chapter on factory floors, power stations and plants across Nigeria and beyond." />
          {loading ? (
            <Spinner />
          ) : visits.length === 0 ? (
            <EmptyState title="No industry visits published yet" message="Photos from trips like the Ghana industrial tour will appear here." />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {visits.map((visit) => (
                <figure key={visit.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={visit.imageUrl} alt={visit.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-3 text-xs font-semibold text-white">
                    {visit.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
