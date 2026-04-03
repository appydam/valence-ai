import { useState, useCallback } from "react";

export interface CsvRow {
  [key: string]: string;
}

export interface CsvImportState {
  headers: string[];
  rows: CsvRow[];
  errors: string[];
  fileName: string | null;
}

export function useCsvImport() {
  const [state, setState] = useState<CsvImportState>({
    headers: [],
    rows: [],
    errors: [],
    fileName: null,
  });
  const [loading, setLoading] = useState(false);

  const parseFile = useCallback((file: File) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim());

        if (lines.length < 2) {
          setState({ headers: [], rows: [], errors: ["File must have a header row and at least one data row"], fileName: file.name });
          setLoading(false);
          return;
        }

        const headers = parseCsvLine(lines[0]);
        const rows: CsvRow[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvLine(lines[i]);
          if (values.length !== headers.length) {
            errors.push(`Row ${i + 1}: expected ${headers.length} columns, got ${values.length}`);
            continue;
          }
          const row: CsvRow = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx];
          });
          rows.push(row);
        }

        setState({ headers, rows, errors, fileName: file.name });
      } catch (err) {
        setState({ headers: [], rows: [], errors: [`Failed to parse CSV: ${err}`], fileName: file.name });
      }
      setLoading(false);
    };

    reader.onerror = () => {
      setState({ headers: [], rows: [], errors: ["Failed to read file"], fileName: file.name });
      setLoading(false);
    };

    reader.readAsText(file);
  }, []);

  const clear = useCallback(() => {
    setState({ headers: [], rows: [], errors: [], fileName: null });
  }, []);

  return { ...state, loading, parseFile, clear };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
