import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface RelatedItem {
  title: string;
  href: string;
  description?: string;
  label?: string;
}

interface RelatedContentProps {
  items: RelatedItem[];
  heading?: string;
}

export function RelatedContent({ items, heading = "Related Resources" }: RelatedContentProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border/30 pt-10 mt-10">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-mono mb-5">
        {heading}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.href}
            className="group flex flex-col gap-2 p-4 rounded-xl border border-border/30 hover:border-border/60 transition-colors"
            style={{ background: "hsl(240 20% 5% / 0.5)" }}
          >
            {item.label && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                {item.label}
              </span>
            )}
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
              {item.title}
            </span>
            {item.description && (
              <span className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {item.description}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-primary/60 group-hover:text-primary transition-colors mt-auto pt-1">
              Read more <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
