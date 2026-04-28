import { Link } from "@/i18n/navigation";
import { HomeIcon } from "@/components/ui/icons";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type ContentBreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function ContentBreadcrumb({ items }: ContentBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-well-bg)] px-8 py-4 text-sm text-[var(--tott-muted)]"
    >
      <Link href="/" className="shrink-0 text-[var(--tott-muted)] hover:text-foreground">
        <HomeIcon />
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-[var(--tott-card-border)]">›</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
