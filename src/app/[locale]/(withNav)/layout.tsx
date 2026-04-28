import { NavbarDynamic } from "@/components/layout/NavbarDynamic";
import { ArticleReadingHeaderProvider } from "@/components/layout/ArticleReadingHeaderContext";
import { WithNavAuthGate } from "@/components/layout/WithNavAuthGate";
import { MotionProvider } from "@/components/motion/MotionProvider";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MotionProvider>
      <WithNavAuthGate>
        <ArticleReadingHeaderProvider>
          <NavbarDynamic />
          {children}
        </ArticleReadingHeaderProvider>
      </WithNavAuthGate>
    </MotionProvider>
  );
}
