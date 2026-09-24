"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useToast } from "@/context/ToastProvider";
import { requestPasswordReset } from "@/lib/auth";
import { errorMessage } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
      toast("Reset link sent. Check your inbox.");
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-center text-2xl font-bold">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Enter your account email and we&apos;ll send a secure reset link.
        </p>
        <form onSubmit={onSubmit} className="card mt-6 grid gap-4 p-6">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@student.oauife.edu.ng"
          />
          <Button type="submit" loading={loading} className="w-full">
            <KeyRound className="h-4 w-4" aria-hidden /> Send reset link
          </Button>
          {sent && (
            <p className="rounded-lg bg-success-soft px-4 py-2 text-center text-sm font-semibold text-success">
              If an account exists for {email}, a reset link is on its way.
            </p>
          )}
          <p className="text-center text-sm text-ink-muted">
            Remembered it?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
