import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-10 text-xs text-muted-foreground", className)}>
      <ol className="flex items-center gap-2 uppercase tracking-[0.15em] flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRight className="size-3 shrink-0 text-muted-foreground/40" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate max-w-[200px] md:max-w-none",
                    isLast && "text-foreground font-medium"
                  )}
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px] md:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
