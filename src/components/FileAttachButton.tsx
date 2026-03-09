import { useRef, useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Paperclip, X, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileAttachButtonProps {
  onSummaryReady: (summary: string, fileName: string) => void;
  onClear: () => void;
  attachedFileName: string | null;
  className?: string;
  /** "toolbar" for Autopilot bottom bar, "block" for modal */
  variant?: "toolbar" | "block";
}

const ACCEPTED_TYPES = ".pdf,.docx,.txt,.md";

export function FileAttachButton({
  onSummaryReady,
  onClear,
  attachedFileName,
  className,
  variant = "toolbar",
}: FileAttachButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateUploadUrl = useMutation(api.attachmentStorage.generateUploadUrl);
  const extractAndSummarize = useAction(api.attachments.extractAndSummarize);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setError(null);
    setIsProcessing(true);

    try {
      // 1. Get Convex upload URL
      const uploadUrl = await generateUploadUrl();

      // 2. POST file to Convex storage
      const uploadResp = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadResp.ok) throw new Error(`Upload failed: ${uploadResp.status}`);

      const { storageId } = await uploadResp.json();

      // 3. Extract + summarize via Convex action (deletes file from storage when done)
      const { summary, fileName } = await extractAndSummarize({
        storageId,
        fileName: file.name,
        fileType: file.type || "",
      });

      onSummaryReady(summary, fileName);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  if (variant === "toolbar") {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={handleFileChange}
        />

        {attachedFileName ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{
              background: "hsl(var(--primary) / 0.12)",
              color: "hsl(var(--primary) / 0.9)",
              border: "1px solid hsl(var(--primary) / 0.25)",
            }}
          >
            <FileText className="w-3 h-3 shrink-0" />
            <span className="max-w-[120px] truncate">{attachedFileName}</span>
            <span className="text-[10px] opacity-70">· summarized ✓</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : isProcessing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Summarizing…</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            title="Attach PDF, Word, or text file for context"
          >
            <Paperclip className="w-3.5 h-3.5" />
            Attach
          </button>
        )}

        {error && (
          <span className="text-[10px] text-destructive max-w-[150px] truncate" title={error}>
            {error}
          </span>
        )}
      </div>
    );
  }

  // "block" variant for NewTaskModal
  return (
    <div className={cn("space-y-1.5", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
      />

      {attachedFileName ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/80 border border-border">
          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs text-foreground flex-1 truncate">{attachedFileName}</span>
          <span className="text-[10px] text-emerald-400 shrink-0">summarized ✓</span>
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-secondary/50 transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              Summarizing with Claude Sonnet…
            </>
          ) : (
            <>
              <Paperclip className="w-3.5 h-3.5 shrink-0" />
              Attach context file (PDF, Word, TXT, MD)
            </>
          )}
        </button>
      )}

      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
