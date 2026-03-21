import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Image, Wand2, Loader2, Download, ExternalLink } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

const STYLE_OPTIONS = [
  { id: "photorealistic", label: "Photorealistic" },
  { id: "illustration", label: "Illustration" },
  { id: "flat", label: "Flat Design" },
  { id: "3d", label: "3D Render" },
] as const;

const FORMAT_OPTIONS = [
  { id: "1:1", label: "Square 1:1", desc: "1080x1080" },
  { id: "16:9", label: "Landscape 16:9", desc: "1920x1080" },
  { id: "9:16", label: "Stories 9:16", desc: "1080x1920" },
  { id: "728x90", label: "Banner 728x90", desc: "728x90" },
] as const;

interface GeneratedImage {
  taskId: string;
  title: string;
  deliverable?: string;
  status: string;
}

export function ImageGenerator() {
  const { config } = useNiche();
  const { triggerAgent, loading: triggerLoading } = useAgentTrigger();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string>("photorealistic");
  const [format, setFormat] = useState<string>("1:1");

  const tasks = useQuery(api.tasks.list, {});
  const imageTasks: GeneratedImage[] = (tasks ?? [])
    .filter(
      (t: { tags?: string[]; title: string }) =>
        t.tags?.includes("creative-image") && t.tags?.includes("niche:ads")
    )
    .map((t: { _id: string; title: string; deliverable?: string; status: string }) => ({
      taskId: t._id,
      title: t.title,
      deliverable: t.deliverable,
      status: t.status,
    }));

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const description = [
      `Generate ad creative images based on this brief:`,
      `Prompt: ${prompt}`,
      `Style: ${style}`,
      `Format: ${format}`,
      ``,
      `Create 3-4 image concepts optimized for ad platforms. Describe each image in detail and generate visual concepts.`,
    ].join("\n");

    await triggerAgent("Ghost", `Ad Image: ${prompt.slice(0, 60)}`, description, [
      "niche:ads",
      "creative-image",
    ]);
    setPrompt("");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Image className="w-4 h-4" style={{ color: config.accentColor }} />
          AI Image Generator
        </h2>

        {/* Prompt */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Image Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the ad image you want to create. E.g., 'Modern SaaS dashboard on laptop screen with happy professional user, bright office background...'"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Style Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  style === s.id
                    ? "border-2 shadow-sm"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
                style={
                  style === s.id
                    ? {
                        borderColor: config.accentColor,
                        color: config.accentColor,
                        background: `${config.accentColor}08`,
                      }
                    : undefined
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">
            Platform Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all text-left ${
                  format === f.id
                    ? "border-2 shadow-sm"
                    : "border-border text-muted-foreground hover:border-border/80"
                }`}
                style={
                  format === f.id
                    ? {
                        borderColor: config.accentColor,
                        color: config.accentColor,
                        background: `${config.accentColor}08`,
                      }
                    : undefined
                }
              >
                <span className="block">{f.label}</span>
                <span className="text-[10px] opacity-60">{f.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={triggerLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
          style={{ background: config.accentColor }}
        >
          {triggerLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending to Ghost...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Images
            </>
          )}
        </button>
      </div>

      {/* Generated Images Grid */}
      {imageTasks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Generated Creatives</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {imageTasks.map((task) => (
              <div
                key={task.taskId}
                className="rounded-xl border border-border bg-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground truncate pr-2">
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      task.status === "done"
                        ? "bg-green-500/10 text-green-500"
                        : task.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>

                {task.status === "in_progress" && (
                  <div className="flex items-center gap-2 py-4 justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Ghost is working...</span>
                  </div>
                )}

                {task.status === "done" && task.deliverable && (
                  <div className="space-y-2">
                    <div className="aspect-video rounded-lg bg-accent/20 flex items-center justify-center border border-border/50">
                      <div className="text-center p-3">
                        <Image className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground line-clamp-3">
                          {task.deliverable.slice(0, 200)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="w-3 h-3" /> Save
                      </button>
                      <button className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors">
                        <ExternalLink className="w-3 h-3" /> View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
