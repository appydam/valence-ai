import { useState } from "react";
import { Image, Sparkles, Check, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

interface ImageGeneratorProps {
  onSelectImage?: (url: string) => void;
}

type ImageStyle = "social" | "blog" | "newsletter" | "minimal";
type ImageSize = "square" | "landscape" | "stories" | "twitter";

const STYLES: { id: ImageStyle; label: string }[] = [
  { id: "social", label: "Social Media" },
  { id: "blog", label: "Blog Header" },
  { id: "newsletter", label: "Newsletter" },
  { id: "minimal", label: "Minimal" },
];

const SIZES: { id: ImageSize; label: string; dimensions: string }[] = [
  { id: "square", label: "Square", dimensions: "1080x1080" },
  { id: "landscape", label: "Landscape", dimensions: "1200x628" },
  { id: "stories", label: "Stories", dimensions: "1080x1920" },
  { id: "twitter", label: "Twitter", dimensions: "1600x900" },
];

const PLACEHOLDER_IMAGES = [
  "https://placehold.co/400x400/1a1a2e/e0e0e0?text=AI+Generated",
  "https://placehold.co/400x400/16213e/e0e0e0?text=Concept+A",
  "https://placehold.co/400x400/0f3460/e0e0e0?text=Concept+B",
  "https://placehold.co/400x400/533483/e0e0e0?text=Concept+C",
];

export function ImageGenerator({ onSelectImage }: ImageGeneratorProps) {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<ImageStyle>("social");
  const [size, setSize] = useState<ImageSize>("square");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    setGeneratedImages([]);
    setSelectedImage(null);

    const selectedSize = SIZES.find((s) => s.id === size);
    const selectedStyle = STYLES.find((s) => s.id === style);

    const result = await triggerAgent(
      "Ghost",
      `Generate image: ${prompt.slice(0, 60)}`,
      `Generate an AI image with the following specifications:
- Prompt: ${prompt}
- Style: ${selectedStyle?.label ?? style}
- Size: ${selectedSize?.dimensions ?? "1080x1080"}
- Use the openai-image-gen skill to generate this image.
Return the image URL in the deliverable.`,
      ["niche:content", "image-gen"],
      { priority: "high", requiredIntegrations: ["openai"] }
    );

    if (result.success && result.taskId) {
      setTaskId(result.taskId);
    }

    // Show placeholder images after a delay to simulate generation
    setTimeout(() => {
      setGeneratedImages(PLACEHOLDER_IMAGES);
      setGenerating(false);
    }, 2000);
  };

  const handleSelectImage = (url: string) => {
    setSelectedImage(url);
  };

  const handleUseImage = () => {
    if (selectedImage && onSelectImage) {
      onSelectImage(selectedImage);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-4 h-4" style={{ color: config.accentColor }} />
        <h3 className="text-sm font-semibold text-foreground">AI Image Generator</h3>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Image Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Style Selector */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Style
        </label>
        <div className="flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                style === s.id
                  ? "border-transparent text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              style={style === s.id ? { background: config.accentColor } : undefined}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size Presets */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                size === s.id
                  ? "border-transparent text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              style={size === s.id ? { background: config.accentColor } : undefined}
            >
              {s.label}
              <span className="ml-1 opacity-60">{s.dimensions}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={generating || agentLoading || !prompt.trim()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
        style={{ background: config.accentColor }}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate
          </>
        )}
      </button>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            Generated Images
          </label>
          <div className="grid grid-cols-2 gap-3">
            {generatedImages.map((url, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectImage(url)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === url
                    ? "border-current shadow-lg"
                    : "border-border hover:border-border/80"
                }`}
                style={selectedImage === url ? { borderColor: config.accentColor } : undefined}
              >
                <img
                  src={url}
                  alt={`Generated ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {selectedImage === url && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: config.accentColor }}
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Use Image Button */}
      {selectedImage && onSelectImage && (
        <button
          onClick={handleUseImage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
          style={{ background: config.accentColor }}
        >
          <Check className="w-4 h-4" />
          Use This Image
        </button>
      )}
    </div>
  );
}
