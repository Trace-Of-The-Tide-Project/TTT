import { PageTransition } from "@/components/motion/PageTransition";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
