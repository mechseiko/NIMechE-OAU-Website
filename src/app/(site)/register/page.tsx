"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/context/ToastProvider";
import { useCollection } from "@/hooks/useCollection";
import { registerAccount } from "@/lib/auth";
import { COL } from "@/lib/db";
import { errorMessage } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/validation";
import type { Genesis } from "@/types";

const LEVELS = ["100", "200", "300", "400", "500", "Postgraduate", "Alumni"];

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });
  const { data: genesis } = useCollection<Genesis>(COL.genesis);
  const firstAccount = genesis.length === 0;

  async function onSubmit(input: RegisterInput) {
    try {
      await registerAccount(input);
      toast(
        firstAccount
          ? "Account created — you are the founding Super Admin of this deployment."
          : "Account created. Welcome to the chapter!",
      );
      router.push("/dashboard");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Image src="/images/logo-nimeche.jpg" alt="NIMechE logo" width={72} height={72} className="mx-auto rounded-full object-cover ring-4 ring-accent" />
          <h1 className="mt-4 text-2xl font-bold">Become a member</h1>
          <p className="mt-1 text-sm text-ink-muted">
            One account for elections, dues status and chapter updates.
          </p>
          {firstAccount && (
            <p className="mx-auto mt-3 max-w-sm rounded-lg bg-accent-soft px-4 py-2 text-xs font-semibold text-accent-dark">
              First account on this deployment becomes the Super Admin — register the chapter's official
              account first.
            </p>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-6 sm:grid-cols-2" noValidate>
          <div className="sm:col-span-2">
            <Input label="Full name" required placeholder="Surname Firstname" error={errors.displayName?.message} {...register("displayName")} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Email" type="email" required placeholder="you@student.oauife.edu.ng" error={errors.email?.message} {...register("email")} />
          </div>
          <Input label="Matric number" placeholder="EGD/21/1234" hint="Required to vote in elections" error={errors.matricNumber?.message} {...register("matricNumber")} />
          <Select label="Level" options={LEVELS.map((level) => ({ value: level, label: level }))} placeholder="Select level" error={errors.level?.message} {...register("level")} />
          <div className="sm:col-span-2">
            <Input label="Password" type="password" required autoComplete="new-password" hint="At least 6 characters" error={errors.password?.message} {...register("password")} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={isSubmitting} className="w-full">
              <UserPlus className="h-4 w-4" aria-hidden /> Create account
            </Button>
          </div>
          <p className="text-center text-sm text-ink-muted sm:col-span-2">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
