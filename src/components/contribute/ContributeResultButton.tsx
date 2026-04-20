"use client";

import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

type ContributeResultButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
};

export function ContributeResultButton({
  href,
  children,
  variant = "primary",
}: ContributeResultButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Link
      href={href}
      className={`inline-block select-none rounded-lg px-5 py-2 text-center text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
        isOutline
          ? "border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-foreground hover:bg-[var(--tott-well-bg)]"
          : ""
      }`}
      style={
        isOutline
          ? undefined
          : {
              backgroundColor: theme.accentGold,
              color: theme.bgDark,
              boxShadow: `0 0 0 1px ${theme.accentGold}`,
            }
      }
    >
      {children}
    </Link>
  );
}
