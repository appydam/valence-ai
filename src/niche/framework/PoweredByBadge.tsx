import { ExternalLink } from "lucide-react";

export function PoweredByBadge() {
  return (
    <a
      href="https://usevalence.ai"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
    >
      <img src="/logo.svg" alt="Valence AI" className="w-5 h-5" />
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
        Powered by <span className="font-semibold text-foreground/80">Valence AI</span>
      </span>
      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
