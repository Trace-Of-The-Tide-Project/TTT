import { PageTransition } from "@/components/motion/PageTransition";
import { NavigationProgress } from "@/components/motion/NavigationProgress";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationProgress />
      <PageTransition>{children}</PageTransition>
    </>
  );
}
