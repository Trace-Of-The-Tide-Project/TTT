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
      className="flex items-center gap-2 rounded-xl border border-gray-800 bg-[#1a1a1a] px-8 py-4 text-sm text-gray-400"
    >
      <Link href="/" className="shrink-0 text-gray-500 hover:text-white">
        <HomeIcon />
      </Link>

      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-gray-600">›</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-white">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
