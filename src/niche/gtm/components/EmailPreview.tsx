interface EmailPreviewProps {
  subject: string;
  from: string;
  to: string;
  body: string;
  accentColor: string;
}

export function EmailPreview({ subject, from, to, body, accentColor }: EmailPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-background overflow-hidden">
      {/* Email Header */}
      <div className="px-4 py-3 border-b border-border/50 space-y-1.5 bg-accent/10">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground w-12 shrink-0">From</span>
          <span className="text-xs text-foreground">{from}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground w-12 shrink-0">To</span>
          <span className="text-xs text-foreground">{to}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground w-12 shrink-0">Subject</span>
          <span className="text-xs font-medium text-foreground">{subject}</span>
        </div>
      </div>

      {/* Email Body */}
      <div className="px-4 py-4">
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {body.split(/(\{\{[^}]+\}\})/).map((part, i) => {
            if (part.startsWith("{{") && part.endsWith("}}")) {
              return (
                <span
                  key={i}
                  className="px-1 py-0.5 rounded text-xs font-medium"
                  style={{
                    background: `${accentColor}15`,
                    color: accentColor,
                  }}
                >
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
