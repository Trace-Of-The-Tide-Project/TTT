"use client";

import dynamic from "next/dynamic";

function NavbarFallback() {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-white py-2 dark:bg-black"
      aria-hidden
    >
      <div className="h-14 w-full" />
    </header>
  );
}

const Navbar = dynamic(
  () => import("@/components/layout/Navbar").then((mod) => ({ default: mod.Navbar })),
  { ssr: false, loading: () => <NavbarFallback /> },
);

export function NavbarDynamic() {
  return <Navbar />;
}
