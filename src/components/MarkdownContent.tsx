import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content, className = "" }: { content: string; className?: string }) {
  return (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-base font-bold text-foreground mt-4 mb-2 first:mt-0">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold text-foreground mt-3 mb-1.5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-2 mb-1">{children}</h3>,
          p: ({ children }) => <p className="text-sm text-foreground/80 leading-relaxed mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="text-sm text-foreground/80 list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="text-sm text-foreground/80 list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-sm text-foreground/80">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {children}
            </a>
          ),
          code: ({ children, className: codeClassName }) => {
            const isBlock = codeClassName?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-black/30 rounded-lg p-3 overflow-x-auto mb-2">
                  <code className="text-xs text-foreground/90 font-mono">{children}</code>
                </pre>
              );
            }
            return <code className="bg-black/20 px-1.5 py-0.5 rounded text-xs font-mono text-foreground/90">{children}</code>;
          },
          pre: ({ children }) => <>{children}</>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-3 my-2 text-foreground/60">{children}</blockquote>
          ),
          hr: () => <hr className="border-border my-3" />,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-2">
              <table className="text-xs w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-border px-2 py-1 text-left font-semibold text-foreground bg-secondary">{children}</th>,
          td: ({ children }) => <td className="border border-border px-2 py-1 text-foreground/80">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
