"use client";

import { useState } from "react";
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
import { registerAccount, loginWithGoogle } from "@/lib/auth";
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
  const [googleLoading, setGoogleLoading] = useState(false);

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

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      toast("Welcome to the chapter!");
      router.push("/dashboard");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setGoogleLoading(false);
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
              First account on this deployment becomes the Super Admin — register the chapter’s official
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
            <Button type="button" variant="outline" className="w-full" loading={googleLoading} onClick={onGoogle}>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <p className="text-center text-xs text-ink-muted">
              Recommended for enhanced security
            </p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" loading={isSubmitting} className="w-full">
              <UserPlus className="h-4 w-4" aria-hidden /> Create account with email
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
