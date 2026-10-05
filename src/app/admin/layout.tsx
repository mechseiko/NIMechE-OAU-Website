"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Button } from "@/components/ui/Button";
import { EmptyState, Spinner } from "@/components/ui/Feedback";
import { useAuth } from "@/context/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/admin");
  }, [loading, user, router]);

  if (!isFirebaseConfigured) {
    return (
      <main id="main" className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" aria-hidden />}
          title="Firebase is not configured"
          message="Copy .env.example to .env.local, paste your Firebase web-app config and Cloudinary keys, restart the dev server, and the dashboard comes alive."
        />
      </main>
    );
  }

  if (loading || !user) return <Spinner label="Verifying your credentials" className="min-h-screen" />;

  if (!isAdmin) {
    return (
      <main id="main" className="flex min-h-screen items-center justify-center p-6">
        <EmptyState
          icon={<ShieldAlert className="h-6 w-6" aria-hidden />}
          title="Administrators only"
          message="This area is restricted to accounts whose profile role is “admin”. Ask an existing administrator to set role: admin on your user document in Firestore."
          action={
            <Link href="/">
              <Button variant="outline">Back to site</Button>
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <AdminShell>
      {profile ? children : <Spinner label="Loading your profile" />}
    </AdminShell>
  );
}
