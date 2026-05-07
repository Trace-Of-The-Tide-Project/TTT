import HexBackground from "@/components/ui/HexBackground";
import { MagazineHero } from "@/components/home/magazine/MagazineHero";
import { MagazineTabs } from "@/components/home/magazine/MagazineTabs";
import { MagazineNewsletter } from "@/components/home/magazine/MagazineNewsletter";

export default function MagazinePreviewPage() {
  return (
    <main
      className="relative min-h-screen"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      {/* Decorative hex band — exact same wrapper as admin DashboardLayout
          (h-35 = 140px, no responsive variants), so the band reads at the
          same scale here as it does in the admin. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative">
        <MagazineHero />
        <MagazineTabs />
        <MagazineNewsletter />
      </div>
    </main>
  );
}
