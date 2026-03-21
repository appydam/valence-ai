import { useState } from "react";
import { Rocket, Clock, Plug, Search, Layers } from "lucide-react";
import { useNiche } from "./NicheContext";
import type { AutopilotTemplate } from "@/data/autopilotTemplates";

interface TemplatesMarketplaceProps {
  templates: AutopilotTemplate[];
  onLaunch?: (template: AutopilotTemplate) => void;
}

export function TemplatesMarketplace({ templates, onLaunch }: TemplatesMarketplaceProps) {
  const { config } = useNiche();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | "all">("all");

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filtered = templates.filter((t) => {
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5" style={{ color: config.accentColor }} />
            Workflow Templates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-built AI workflows ready to launch
          </p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "all"
                ? "text-white"
                : "bg-accent/30 text-muted-foreground hover:text-foreground"
            }`}
            style={selectedCategory === "all" ? { background: config.accentColor } : undefined}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "text-white"
                  : "bg-accent/30 text-muted-foreground hover:text-foreground"
              }`}
              style={selectedCategory === cat ? { background: config.accentColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-border/80 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/50 text-muted-foreground">
                    {template.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>

            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                {template.plan.tasks.length} tasks
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {template.plan.estimatedDuration}
              </span>
              {template.plan.tasks.some((t) => t.requiredIntegrations.length > 0) && (
                <span className="flex items-center gap-1">
                  <Plug className="w-3 h-3" />
                  {Array.from(
                    new Set(template.plan.tasks.flatMap((t) => t.requiredIntegrations))
                  ).length}{" "}
                  integrations
                </span>
              )}
            </div>

            <button
              onClick={() => onLaunch?.(template)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ background: config.accentColor }}
            >
              <Rocket className="w-3.5 h-3.5" />
              Launch Workflow
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No templates found</p>
        </div>
      )}
    </div>
  );
}
