"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type CSSProperties } from "react";
import type { CmsNavLink } from "@/lib/nav/cms-nav-links";

function NavbarFallback() {
  // Must match the real Navbar's layout mode: it renders an ABSOLUTE header
  // (out of flow, overlaying the page). A sticky/in-flow fallback reserves
  // ~72px that vanishes when the real navbar swaps in, shifting the whole
  // page up (measured CLS ≈ 0.09 on the homepage).
  return (
    <header className="absolute inset-x-0 top-0 z-50 w-full py-2" aria-hidden>
      <div className="h-14 w-full" />
    </header>
  );
}

const Navbar = dynamic(
  () => import("@/components/layout/Navbar").then((mod) => ({ default: mod.Navbar })),
  { ssr: false, loading: () => <NavbarFallback /> },
);

/** Draft payload posted by the CMS Navigation/Branding tabs' preview channel. */
type NavPreviewPayload = { links?: CmsNavLink[]; logoUrl?: string | null; primaryColor?: string };

// Re-validated here independently of the sender (BrandingTab already checks
// this before posting) — never trust a cross-boundary message's shape.
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function isNavPreviewPayload(v: unknown): v is NavPreviewPayload {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  if (p.links !== undefined && !Array.isArray(p.links)) return false;
  if (p.primaryColor !== undefined && typeof p.primaryColor !== "string") return false;
  return true;
}

export function NavbarDynamic({
  cmsNavLinks,
  logoUrl,
}: {
  cmsNavLinks?: CmsNavLink[] | null;
  logoUrl?: string | null;
}) {
  // CMS preview bridge for the Navigation/Branding tabs: only engages when
  // this route was rendered with the (auth-gated) ?cmsPreview=1 flag, which
  // callers indicate by mounting this component inside a preview frame.
  // Same trust boundary as CmsPreviewBridge — reject any message whose
  // origin isn't our own and whose shape doesn't match.
  const [draft, setDraft] = useState<NavPreviewPayload | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; payload?: unknown };
      if (!data || data.type !== "tott:cms-nav-preview") return;
      if (!isNavPreviewPayload(data.payload)) return;
      setDraft(data.payload);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const effectiveLinks = draft?.links ?? cmsNavLinks;
  const effectiveLogo = draft && "logoUrl" in draft ? draft.logoUrl : logoUrl;
  const draftColor =
    draft?.primaryColor && HEX_COLOR_PATTERN.test(draft.primaryColor) ? draft.primaryColor : undefined;

  const navbar = <Navbar cmsNavLinks={effectiveLinks} logoUrl={effectiveLogo} />;

  // Branding tab preview: override the accent tokens for just this subtree
  // (only ever reachable inside the admin's iframe preview — the real site
  // gets its override from src/app/[locale]/layout.tsx instead).
  if (!draftColor) return navbar;
  return (
    <div
      style={
        {
          "--tott-accent-gold": draftColor,
          "--tott-accent-gold-focus": draftColor,
          "--tott-logo": draftColor,
        } as CSSProperties
      }
    >
      {navbar}
    </div>
  );
}
