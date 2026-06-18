import { NavbarDynamic } from "@/components/layout/NavbarDynamic";
import { ArticleReadingHeaderProvider } from "@/components/layout/ArticleReadingHeaderContext";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <ArticleReadingHeaderProvider>
        <SubscriptionProvider>
          <NavbarDynamic />
          {children}
        </SubscriptionProvider>
      </ArticleReadingHeaderProvider>
    </MotionProvider>
  );
}
