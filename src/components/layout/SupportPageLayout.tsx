import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { theme } from "@/lib/theme";

type SupportPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SupportPageLayout({ title, subtitle, children }: SupportPageLayoutProps) {
  return (
    <div
      className="relative min-h-screen w-full select-none"
      style={{ backgroundColor: theme.pageBackground }}
    >
      <div className="relative">
        <div className="absolute inset-0">
          <HexBackground />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-10 sm:pt-24">
          <div className="flex flex-col items-baseline gap-4">
            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
            {subtitle && <p className="text-sm" style={{ color: "var(--tott-muted)" }}>{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-16 sm:pb-24">
        <div className="space-y-10 text-foreground/80">{children}</div>
      </div>

      <ShareYourStory />
    </div>
  );
}
