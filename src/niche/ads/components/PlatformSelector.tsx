import { Check } from "lucide-react";
import { AD_PLATFORMS } from "../data/adsPlatforms";

interface PlatformSelectorProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PlatformSelector({ selected, onChange }: PlatformSelectorProps) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {AD_PLATFORMS.map((platform) => {
        const isSelected = selected.includes(platform.id);
        return (
          <button
            key={platform.id}
            onClick={() => toggle(platform.id)}
            className={`relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? "shadow-sm"
                : "border-border hover:border-border/80"
            }`}
            style={
              isSelected
                ? { borderColor: platform.color, background: `${platform.color}08` }
                : undefined
            }
          >
            {isSelected && (
              <div
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: platform.color }}
              >
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-2xl">{platform.icon}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{platform.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {platform.formats.slice(0, 3).join(", ")}
                {platform.formats.length > 3 && ` +${platform.formats.length - 3}`}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
