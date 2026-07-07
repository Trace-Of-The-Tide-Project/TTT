import { Footer } from "@/components/layout/Footer";
import { NavigationProgress } from "@/components/motion/NavigationProgress";
import { PageTransition } from "@/components/motion/PageTransition";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationProgress />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
