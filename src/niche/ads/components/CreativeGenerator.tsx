import { Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNiche } from "../../framework/NicheContext";

interface CreativeGeneratorProps {
  onGenerate?: (prompt: string) => void;
}

export function CreativeGenerator({ onGenerate }: CreativeGeneratorProps) {
  const { config } = useNiche();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    onGenerate?.(prompt);
    // Simulate generation time
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4" style={{ color: config.accentColor }} />
        <span className="text-sm font-medium text-foreground">Quick Generate</span>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your product and target audience..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
      <button
        onClick={handleGenerate}
        disabled={generating || !prompt.trim()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-50"
        style={{ background: config.accentColor }}
      >
        {generating ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-3 h-3" />
            Generate
          </>
        )}
      </button>
    </div>
  );
}
