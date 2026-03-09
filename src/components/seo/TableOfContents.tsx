import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentSelector?: string;
}

export function TableOfContents({ contentSelector = ".prose" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2, h3")) as HTMLElement[];
    const tocItems: TocItem[] = headings.map((h, i) => {
      if (!h.id) {
        h.id = h.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `heading-${i}`;
      }
      return {
        id: h.id,
        text: h.textContent || "",
        level: parseInt(h.tagName[1]),
      };
    });
    setItems(tocItems);
  }, [contentSelector]);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -70% 0%" }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav
      className="hidden xl:block sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto py-4"
      aria-label="Table of contents"
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              className={`block text-xs py-1 leading-snug transition-colors hover:text-foreground ${
                activeId === item.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground/60"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
