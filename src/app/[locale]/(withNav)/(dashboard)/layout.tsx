import { PageTransition } from "@/components/motion/PageTransition";
import { NavigationProgress } from "@/components/motion/NavigationProgress";
import { DashboardAuthGate } from "@/components/layout/DashboardAuthGate";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGate>
      <NavigationProgress />
      <PageTransition>{children}</PageTransition>
    </DashboardAuthGate>
  );
}
