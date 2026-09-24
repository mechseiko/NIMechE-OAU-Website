"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Suspense } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/context/ToastProvider";
import { loginAccount, loginWithGoogle } from "@/lib/auth";
import { errorMessage } from "@/lib/utils";
import { loginSchema, type LoginInput } from "@/lib/validation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const { toast } = useToast();
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(input: LoginInput) {
    try {
      await loginAccount(input.email, input.password);
      toast("Welcome back!");
      router.push(next);
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push(next);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/images/logo-nimeche.jpg" alt="NIMechE logo" width={72} height={72} className="mx-auto h-18 w-18 rounded-full object-cover ring-4 ring-accent" />
          <h1 className="mt-4 text-2xl font-bold">Sign in to your account</h1>
          <p className="mt-1 text-sm text-ink-muted">Members can vote in elections and manage their profile.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 p-6" noValidate>
          <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register("email")} />
          <Input label="Password" type="password" required autoComplete="current-password" error={errors.password?.message} {...register("password")} />
          <div className="flex items-center justify-between text-sm">
            <Link href="/forgot-password" className="font-semibold text-secondary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            <LogIn className="h-4 w-4" aria-hidden /> Sign in
          </Button>
          <Button type="button" variant="outline" className="w-full" loading={googleLoading} onClick={onGoogle}>
            Continue with Google
          </Button>
          <p className="text-center text-sm text-ink-muted">
            New member?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
