import type { CalendarContentItem } from "../pages/CalendarView";

interface CalendarGridProps {
  currentDate: Date;
  contentItems: CalendarContentItem[];
  platformColors: Record<string, string>;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarGrid({ currentDate, contentItems, platformColors }: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0=Sun, adjust to 0=Mon)
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days in previous month (for padding)
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Today's date for highlighting
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Build calendar cells
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];

  for (let i = 0; i < totalCells; i++) {
    if (i < startOffset) {
      // Previous month
      const day = daysInPrevMonth - startOffset + 1 + i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      cells.push({ day, inMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}` });
    } else if (i - startOffset < daysInMonth) {
      const day = i - startOffset + 1;
      cells.push({ day, inMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` });
    } else {
      // Next month
      const day = i - startOffset - daysInMonth + 1;
      const m = month + 2 > 12 ? 1 : month + 2;
      const y = month + 2 > 12 ? year + 1 : year;
      cells.push({ day, inMonth: false, dateStr: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}` });
    }
  }

  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_NAMES.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {weeks.map((week, weekIdx) => (
        <div key={weekIdx} className="grid grid-cols-7 border-b border-border/30 last:border-b-0">
          {week.map((cell, cellIdx) => {
            const isToday = isCurrentMonth && cell.inMonth && cell.day === todayDate;
            const items = contentItems.filter((item) => item.date === cell.dateStr);

            return (
              <div
                key={cellIdx}
                className={`min-h-[90px] px-1.5 py-1.5 border-r border-border/20 last:border-r-0 transition-colors hover:bg-accent/10 ${
                  !cell.inMonth ? "opacity-30" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {cell.day}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: platformColors[item.platform] ?? "hsl(0,0%,40%)" }}
                      title={`${item.title} (${item.time})`}
                    >
                      {item.title}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{items.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
