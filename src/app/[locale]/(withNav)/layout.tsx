import { Footer } from "@/components/layout/Footer";
import { NavbarDynamic } from "@/components/layout/NavbarDynamic";
import { ArticleReadingHeaderProvider } from "@/components/layout/ArticleReadingHeaderContext";
import { WithNavAuthGate } from "@/components/layout/WithNavAuthGate";

export default function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WithNavAuthGate>
      <ArticleReadingHeaderProvider>
        <NavbarDynamic />
        {children}
        <Footer />
      </ArticleReadingHeaderProvider>
    </WithNavAuthGate>
  );
}
