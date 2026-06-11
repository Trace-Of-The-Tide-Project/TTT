"use client";

import { Link } from "@/i18n/navigation";

type AuthInlineLinkProps = {
  /** Lead-in copy, e.g. "Already have an account?" */
  text?: React.ReactNode;
  /** Destination for the gold link. */
  href: string;
  /** Visible label of the gold link, e.g. "Login". */
  label: string;
  className?: string;
};

/**
 * Compact inline link rendered *inside* an auth card (under the submit button).
 *
 * Use for "Already have an account? Login" / "Don't have an account? Sign up"
 * type prompts. For the page-level "Back to home" line use `AuthFooterLinks`.
 */
export function AuthInlineLink({ text, href, label, className }: AuthInlineLinkProps) {
  return (
    <p className={`text-center text-sm text-foreground ${className ?? ""}`}>
      {text ? <>{text} </> : null}
      <Link
        href={href}
        className="cursor-pointer font-medium text-[color:var(--tott-accent-gold)] hover:underline"
      >
        {label}
      </Link>
    </p>
  );
}
