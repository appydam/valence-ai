import { useState, useCallback } from "react";
import {
  Layout,
  Type,
  Grid3X3,
  MessageSquareQuote,
  ArrowRight,
  MoreHorizontal,
  Plus,
  Trash2,
  Download,
  Wand2,
  ChevronUp,
  ChevronDown,
  Code,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plug,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

type BlockType = "hero" | "features" | "testimonials" | "cta-band" | "footer";

interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
  bgColor: string;
}

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesData {
  items: FeatureItem[];
}

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

interface TestimonialsData {
  items: TestimonialItem[];
}

interface CtaBandData {
  text: string;
  ctaText: string;
  bgColor: string;
}

interface FooterData {
  text: string;
}

type BlockData = HeroData | FeaturesData | TestimonialsData | CtaBandData | FooterData;

interface Block {
  id: string;
  type: BlockType;
  data: BlockData;
}

const BLOCK_PALETTE: { type: BlockType; label: string; icon: typeof Type }[] = [
  { type: "hero", label: "Hero", icon: Layout },
  { type: "features", label: "Features", icon: Grid3X3 },
  { type: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { type: "cta-band", label: "CTA Band", icon: ArrowRight },
  { type: "footer", label: "Footer", icon: MoreHorizontal },
];

function defaultDataForType(type: BlockType): BlockData {
  switch (type) {
    case "hero":
      return {
        headline: "Your Product, Supercharged",
        subheadline: "The fastest way to grow your business with AI-powered advertising",
        ctaText: "Get Started Free",
        bgColor: "hsl(262, 83%, 58%)",
      } as HeroData;
    case "features":
      return {
        items: [
          { icon: "Zap", title: "Lightning Fast", description: "Set up campaigns in minutes, not hours" },
          { icon: "Shield", title: "AI-Optimized", description: "Automatic bid and budget optimization" },
          { icon: "TrendingUp", title: "3x ROAS", description: "Our clients see 3x average return on ad spend" },
        ],
      } as FeaturesData;
    case "testimonials":
      return {
        items: [
          { quote: "This tool cut our CPA by 40% in the first month.", author: "Sarah Chen", role: "Head of Growth, TechCo" },
          { quote: "Finally, an ad platform that actually understands our business.", author: "Mike Ross", role: "CMO, StartupXYZ" },
        ],
      } as TestimonialsData;
    case "cta-band":
      return {
        text: "Ready to transform your ad performance?",
        ctaText: "Start Your Free Trial",
        bgColor: "hsl(262, 83%, 58%)",
      } as CtaBandData;
    case "footer":
      return {
        text: "2026 Your Company. All rights reserved.",
      } as FooterData;
  }
}

function generateHtml(blocks: Block[], accentColor: string): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; }
    .hero { padding: 80px 40px; text-align: center; color: white; }
    .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 16px; }
    .hero p { font-size: 20px; opacity: 0.9; margin-bottom: 32px; }
    .hero button { padding: 14px 32px; font-size: 16px; font-weight: 600; border: none; border-radius: 8px; background: white; color: #1a1a2e; cursor: pointer; }
    .features { padding: 60px 40px; display: flex; gap: 32px; justify-content: center; flex-wrap: wrap; }
    .feature { flex: 1; min-width: 240px; max-width: 320px; text-align: center; padding: 24px; }
    .feature h3 { font-size: 18px; margin: 12px 0 8px; }
    .feature p { font-size: 14px; color: #666; }
    .testimonials { padding: 60px 40px; display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
    .testimonial { flex: 1; min-width: 280px; max-width: 400px; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; }
    .testimonial blockquote { font-size: 15px; font-style: italic; color: #333; margin-bottom: 16px; }
    .testimonial .author { font-size: 13px; font-weight: 600; }
    .testimonial .role { font-size: 12px; color: #888; }
    .cta-band { padding: 60px 40px; text-align: center; color: white; }
    .cta-band p { font-size: 24px; font-weight: 700; margin-bottom: 24px; }
    .cta-band button { padding: 14px 32px; font-size: 16px; font-weight: 600; border: 2px solid white; border-radius: 8px; background: transparent; color: white; cursor: pointer; }
    .footer { padding: 24px 40px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #e0e0e0; }
  </style>
</head>
<body>\n`;

  for (const block of blocks) {
    switch (block.type) {
      case "hero": {
        const d = block.data as HeroData;
        html += `  <section class="hero" style="background: ${d.bgColor}">
    <h1>${d.headline}</h1>
    <p>${d.subheadline}</p>
    <button>${d.ctaText}</button>
  </section>\n`;
        break;
      }
      case "features": {
        const d = block.data as FeaturesData;
        html += `  <section class="features">\n`;
        for (const item of d.items) {
          html += `    <div class="feature">
      <h3>${item.title}</h3>
      <p>${item.description}</p>
    </div>\n`;
        }
        html += `  </section>\n`;
        break;
      }
      case "testimonials": {
        const d = block.data as TestimonialsData;
        html += `  <section class="testimonials">\n`;
        for (const item of d.items) {
          html += `    <div class="testimonial">
      <blockquote>"${item.quote}"</blockquote>
      <div class="author">${item.author}</div>
      <div class="role">${item.role}</div>
    </div>\n`;
        }
        html += `  </section>\n`;
        break;
      }
      case "cta-band": {
        const d = block.data as CtaBandData;
        html += `  <section class="cta-band" style="background: ${d.bgColor}">
    <p>${d.text}</p>
    <button>${d.ctaText}</button>
  </section>\n`;
        break;
      }
      case "footer": {
        const d = block.data as FooterData;
        html += `  <footer class="footer">${d.text}</footer>\n`;
        break;
      }
    }
  }

  html += `</body>\n</html>`;
  return html;
}

export function LandingPageBuilder() {
  const { config } = useNiche();
  const { triggerAgent, loading: aiLoading } = useAgentTrigger();
  const { execute, isConnected, loading: integrationLoading } = useIntegrationCall();
  const githubConnected = isConnected("github");
  const [pushStatus, setPushStatus] = useState<"idle" | "success" | "error">("idle");
  const [pushMessage, setPushMessage] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "hero", data: defaultDataForType("hero") },
    { id: "2", type: "features", data: defaultDataForType("features") },
    { id: "3", type: "cta-band", data: defaultDataForType("cta-band") },
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>("1");
  const [generatingBlockId, setGeneratingBlockId] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      data: defaultDataForType(type),
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    [newBlocks[idx], newBlocks[newIdx]] = [newBlocks[newIdx], newBlocks[idx]];
    setBlocks(newBlocks);
  };

  const updateBlockData = useCallback(
    (id: string, partial: Partial<BlockData>) => {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, data: { ...b.data, ...partial } } : b
        )
      );
    },
    []
  );

  const handleAiGenerate = async (blockId: string, blockType: BlockType) => {
    setGeneratingBlockId(blockId);
    await triggerAgent(
      "Ghost",
      `LP Copy: ${blockType} block`,
      `Generate compelling landing page copy for a "${blockType}" block. The page is for an ad management SaaS product. Write persuasive, conversion-optimized copy. Return the text content only.`,
      ["niche:ads", "landing-page-copy"]
    );
    setGeneratingBlockId(null);
  };

  const handleExportHtml = () => {
    const html = generateHtml(blocks, config.accentColor);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "landing-page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePushToGithub = async () => {
    if (!githubConnected) {
      setPushStatus("error");
      setPushMessage("GitHub not connected. Please connect GitHub in Integrations.");
      return;
    }

    setPushStatus("idle");
    setPushMessage("");

    try {
      const html = generateHtml(blocks, config.accentColor);
      const heroBlock = blocks.find((b) => b.type === "hero");
      const pageName = heroBlock
        ? (heroBlock.data as HeroData).headline.slice(0, 50)
        : "Landing Page";

      const result = await execute("github", "create_issue", {
        owner: "appydam",
        repo: "landing-pages",
        title: `Landing Page: ${pageName}`,
        body: `Generated landing page HTML:\n\n\`\`\`html\n${html}\n\`\`\``,
      });

      if (result.success) {
        setPushStatus("success");
        setPushMessage("Landing page pushed to GitHub successfully!");
      } else {
        setPushStatus("error");
        setPushMessage(result.error ?? "Failed to push to GitHub");
      }
    } catch (err: any) {
      setPushStatus("error");
      setPushMessage(err.message ?? "Failed to push to GitHub");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landing Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build conversion-optimized landing pages with AI-generated copy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportHtml}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export HTML
          </button>
          {githubConnected ? (
            <button
              onClick={handlePushToGithub}
              disabled={integrationLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {integrationLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : pushStatus === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : pushStatus === "error" ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              ) : (
                <Code className="w-3.5 h-3.5" />
              )}
              {pushStatus === "success" ? "Pushed!" : pushStatus === "error" ? "Retry Push" : "Push to GitHub"}
            </button>
          ) : (
            <Link
              to="/integrations"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
            >
              <Plug className="w-3.5 h-3.5" />
              Connect GitHub
            </Link>
          )}
        </div>
      </div>

      {/* Push status toast */}
      {pushMessage && (
        <div
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium ${
            pushStatus === "success"
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {pushStatus === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          {pushMessage}
          <button
            onClick={() => { setPushMessage(""); setPushStatus("idle"); }}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            x
          </button>
        </div>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left — Block Palette */}
        <div className="col-span-2 space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Blocks
          </h2>
          {BLOCK_PALETTE.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => addBlock(type)}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <Plus className="w-3 h-3 ml-auto opacity-40" />
            </button>
          ))}
        </div>

        {/* Center — Live Preview */}
        <div className="col-span-7">
          <div className="rounded-xl border border-border bg-white overflow-hidden">
            <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2 bg-card">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-[10px] text-muted-foreground ml-2">Preview</span>
            </div>
            <div className="min-h-[400px]">
              {blocks.length === 0 && (
                <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                  Add blocks from the left panel to get started
                </div>
              )}
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className={`relative group cursor-pointer ${
                    selectedBlockId === block.id ? "ring-2 ring-offset-0" : ""
                  }`}
                  style={
                    selectedBlockId === block.id
                      ? { ringColor: config.accentColor }
                      : undefined
                  }
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  {/* Block controls */}
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
                      className="p-1 rounded bg-black/60 text-white hover:bg-black/80"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
                      className="p-1 rounded bg-black/60 text-white hover:bg-black/80"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                      className="p-1 rounded bg-red-500/80 text-white hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Render block preview */}
                  {block.type === "hero" && (() => {
                    const d = block.data as HeroData;
                    return (
                      <div
                        className="px-8 py-12 text-center text-white"
                        style={{ background: d.bgColor }}
                      >
                        <h2 className="text-2xl font-bold mb-2">{d.headline}</h2>
                        <p className="text-sm opacity-80 mb-4">{d.subheadline}</p>
                        <span className="inline-block px-4 py-2 bg-white text-black text-xs font-medium rounded-lg">
                          {d.ctaText}
                        </span>
                      </div>
                    );
                  })()}

                  {block.type === "features" && (() => {
                    const d = block.data as FeaturesData;
                    return (
                      <div className="px-6 py-8 grid grid-cols-3 gap-4">
                        {d.items.map((item, i) => (
                          <div key={i} className="text-center p-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 mx-auto mb-2 flex items-center justify-center text-xs">
                              {item.icon.charAt(0)}
                            </div>
                            <h3 className="text-xs font-semibold text-gray-900">{item.title}</h3>
                            <p className="text-[10px] text-gray-500 mt-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {block.type === "testimonials" && (() => {
                    const d = block.data as TestimonialsData;
                    return (
                      <div className="px-6 py-8 flex gap-4">
                        {d.items.map((item, i) => (
                          <div key={i} className="flex-1 p-4 border border-gray-200 rounded-lg">
                            <p className="text-xs italic text-gray-600 mb-2">"{item.quote}"</p>
                            <p className="text-[10px] font-semibold text-gray-900">{item.author}</p>
                            <p className="text-[10px] text-gray-400">{item.role}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {block.type === "cta-band" && (() => {
                    const d = block.data as CtaBandData;
                    return (
                      <div
                        className="px-6 py-10 text-center text-white"
                        style={{ background: d.bgColor }}
                      >
                        <p className="text-lg font-bold mb-3">{d.text}</p>
                        <span className="inline-block px-4 py-2 border-2 border-white text-white text-xs font-medium rounded-lg">
                          {d.ctaText}
                        </span>
                      </div>
                    );
                  })()}

                  {block.type === "footer" && (() => {
                    const d = block.data as FooterData;
                    return (
                      <div className="px-6 py-4 text-center border-t border-gray-200">
                        <p className="text-[10px] text-gray-400">{d.text}</p>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Block Editor */}
        <div className="col-span-3 space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Block Editor
          </h2>
          {!selectedBlock ? (
            <div className="rounded-xl border border-dashed border-border/50 p-6 text-center">
              <p className="text-xs text-muted-foreground">Select a block to edit its content</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground capitalize">
                  {selectedBlock.type.replace("-", " ")}
                </span>
                <button
                  onClick={() => handleAiGenerate(selectedBlock.id, selectedBlock.type)}
                  disabled={aiLoading && generatingBlockId === selectedBlock.id}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-white transition-colors"
                  style={{ background: config.accentColor }}
                >
                  {aiLoading && generatingBlockId === selectedBlock.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Wand2 className="w-3 h-3" />
                  )}
                  AI Generate
                </button>
              </div>

              {selectedBlock.type === "hero" && (() => {
                const d = selectedBlock.data as HeroData;
                return (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Headline</label>
                      <input
                        type="text"
                        value={d.headline}
                        onChange={(e) => updateBlockData(selectedBlock.id, { headline: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Subheadline</label>
                      <textarea
                        value={d.subheadline}
                        onChange={(e) => updateBlockData(selectedBlock.id, { subheadline: e.target.value })}
                        rows={2}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">CTA Button Text</label>
                      <input
                        type="text"
                        value={d.ctaText}
                        onChange={(e) => updateBlockData(selectedBlock.id, { ctaText: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Background Color</label>
                      <input
                        type="text"
                        value={d.bgColor}
                        onChange={(e) => updateBlockData(selectedBlock.id, { bgColor: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                );
              })()}

              {selectedBlock.type === "cta-band" && (() => {
                const d = selectedBlock.data as CtaBandData;
                return (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Text</label>
                      <input
                        type="text"
                        value={d.text}
                        onChange={(e) => updateBlockData(selectedBlock.id, { text: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">CTA Button</label>
                      <input
                        type="text"
                        value={d.ctaText}
                        onChange={(e) => updateBlockData(selectedBlock.id, { ctaText: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-1">Background Color</label>
                      <input
                        type="text"
                        value={d.bgColor}
                        onChange={(e) => updateBlockData(selectedBlock.id, { bgColor: e.target.value })}
                        className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                );
              })()}

              {selectedBlock.type === "footer" && (() => {
                const d = selectedBlock.data as FooterData;
                return (
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-1">Footer Text</label>
                    <input
                      type="text"
                      value={d.text}
                      onChange={(e) => updateBlockData(selectedBlock.id, { text: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                );
              })()}

              {(selectedBlock.type === "features" || selectedBlock.type === "testimonials") && (
                <p className="text-[10px] text-muted-foreground">
                  Use "AI Generate" to regenerate copy for this block, or edit directly in the preview.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
