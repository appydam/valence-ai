import { useCallback, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

interface Props {
  onFileSelect: (file: File) => void;
  fileName: string | null;
  onClear: () => void;
}

export function CsvUploader({ onFileSelect, fileName, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (fileName) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-card">
        <FileText className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
          <p className="text-[10px] text-muted-foreground">Uploaded successfully</p>
        </div>
        <button onClick={onClear} className="p-1 rounded hover:bg-accent/30 transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-border/40 bg-card/50 hover:border-border/60 hover:bg-card/80 transition-all cursor-pointer"
    >
      <Upload className="w-8 h-8 text-muted-foreground/30" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground/80">Drop a CSV file here</p>
        <p className="text-xs text-muted-foreground/50 mt-1">or click to browse</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
