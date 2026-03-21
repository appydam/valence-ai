import { AD_PLATFORMS } from "../data/adsPlatforms";

interface AdPreviewProps {
  platform: string;
}

export function AdPreview({ platform }: AdPreviewProps) {
  const p = AD_PLATFORMS.find((ap) => ap.id === platform);
  if (!p) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium"
      style={{ background: `${p.color}15`, color: p.color }}
    >
      {p.icon} {p.name}
    </span>
  );
}
