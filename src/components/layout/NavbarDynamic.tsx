"use client";

import dynamic from "next/dynamic";
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

export function NavbarDynamic({ cmsNavLinks }: { cmsNavLinks?: CmsNavLink[] | null }) {
  return <Navbar cmsNavLinks={cmsNavLinks} />;
}
