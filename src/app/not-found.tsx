import Link from "next/link";
import { Cog } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <Cog className="mx-auto h-16 w-16 animate-spin text-secondary [animation-duration:6s]" aria-hidden />
        <p className="section-kicker mt-6">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">This part isn&apos;t machined yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back to
          the workshop.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">Report a broken link</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
