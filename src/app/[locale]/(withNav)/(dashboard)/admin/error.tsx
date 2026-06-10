"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { AlertTriangleIcon } from "@/components/ui/icons";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("[Admin Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="relative w-full max-w-md p-8 text-center space-y-5">
        <ChamferedFrame />
        <div className="flex justify-center text-[var(--tott-status-coral)]">
          <AlertTriangleIcon />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>
        {error.message && (
          <p className="text-sm text-[var(--tott-muted)]">{error.message}</p>
        )}
        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border border-[var(--tott-card-border)] px-4 py-2 text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "var(--tott-accent-gold)",
              color: "var(--tott-auth-btn-text, #000)",
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
