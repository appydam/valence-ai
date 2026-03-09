import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground/60 font-mono flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />}
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-muted-foreground transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-foreground/60" : ""}>{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
