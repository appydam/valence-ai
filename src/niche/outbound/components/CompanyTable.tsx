import { useState } from "react";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import type { CsvRow } from "../hooks/useCsvImport";

interface Props {
  headers: string[];
  rows: CsvRow[];
}

export function CompanyTable({ headers, rows }: Props) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const displayHeaders = headers.slice(0, 8); // Cap visible columns

  const sorted = [...rows].sort((a, b) => {
    if (!sortCol) return 0;
    const va = a[sortCol] ?? "";
    const vb = b[sortCol] ?? "";
    const cmp = va.localeCompare(vb, undefined, { numeric: true });
    return sortAsc ? cmp : -cmp;
  });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  };

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border/30 bg-card/80">
              {displayHeaders.map((h) => (
                <th key={h} className="px-4 py-2.5">
                  <button
                    onClick={() => handleSort(h)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider hover:text-foreground transition-colors"
                  >
                    {h}
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="border-b border-border/15 hover:bg-accent/10 transition-colors">
                {displayHeaders.map((h) => {
                  const val = row[h] ?? "";
                  const isUrl = val.startsWith("http://") || val.startsWith("https://");
                  return (
                    <td key={h} className="px-4 py-2.5 text-sm text-foreground/80 max-w-[200px] truncate">
                      {isUrl ? (
                        <a href={val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                          <span className="truncate">{val}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 100 && (
        <div className="px-4 py-2 text-center text-xs text-muted-foreground bg-card/50">
          Showing 100 of {rows.length} rows
        </div>
      )}
    </div>
  );
}
