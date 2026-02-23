import { useCurrentFrame, interpolate, spring } from "remotion";

const COLUMNS = [
  { label: "Inbox", color: "#6B7C96" },
  { label: "Assigned", color: "#3B82F6" },
  { label: "In Progress", color: "#F59E0B" },
  { label: "In Review", color: "#A78BFA" },
  { label: "Done", color: "#10B981" },
];

const TASKS: Record<string, { title: string; agent: string; agentColor: string; priority: string; priorityColor: string }[]> = {
  Inbox: [
    { title: "Analyze Q3 market data", agent: "🔭 Scout", agentColor: "#10B981", priority: "High", priorityColor: "#FF6B35" },
    { title: "Draft investor update", agent: "👻 Ghost", agentColor: "#A78BFA", priority: "Medium", priorityColor: "#FFB800" },
  ],
  Assigned: [
    { title: "Build auth integration", agent: "🔨 Forge", agentColor: "#F59E0B", priority: "Urgent", priorityColor: "#EF4444" },
  ],
  "In Progress": [
    { title: "Competitive analysis", agent: "🔭 Scout", agentColor: "#10B981", priority: "High", priorityColor: "#FF6B35" },
    { title: "Launch copy + tweets", agent: "👻 Ghost", agentColor: "#A78BFA", priority: "High", priorityColor: "#FF6B35" },
  ],
  "In Review": [
    { title: "Landing page redesign", agent: "🔨 Forge", agentColor: "#F59E0B", priority: "Medium", priorityColor: "#FFB800" },
  ],
  Done: [
    { title: "Product Hunt prep", agent: "🌀 Kaze", agentColor: "#3B82F6", priority: "Low", priorityColor: "#6B7C96" },
    { title: "Outreach templates", agent: "👻 Ghost", agentColor: "#A78BFA", priority: "Medium", priorityColor: "#FFB800" },
  ],
};

const TaskCard = ({
  title,
  agent,
  agentColor,
  priority,
  priorityColor,
  delayFrames,
  isDone,
  isMoving,
  moveProgress,
}: {
  title: string;
  agent: string;
  agentColor: string;
  priority: string;
  priorityColor: string;
  delayFrames: number;
  isDone?: boolean;
  isMoving?: boolean;
  moveProgress?: number;
}) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - delayFrames);

  const scale = spring({
    fps: 30,
    frame: localFrame,
    config: { damping: 12, stiffness: 200 },
    from: 0,
    to: 1,
  });

  const opacity = interpolate(localFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const moveX = isMoving ? interpolate(moveProgress ?? 0, [0, 1], [0, 220]) : 0;

  return (
    <div style={{
      backgroundColor: "#0F1622",
      border: `1px solid ${isDone ? "#10B98130" : "#232D3F"}`,
      borderRadius: 8,
      padding: "10px 12px",
      marginBottom: 8,
      opacity,
      transform: `scale(${scale}) translateX(${moveX}px)`,
      boxShadow: isDone ? "0 0 12px rgba(16,185,129,0.15)" : "none",
    }}>
      <div style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 500, marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, color: agentColor, fontWeight: 600 }}>{agent}</div>
        <div style={{
          fontSize: 9, fontWeight: 700, color: priorityColor,
          backgroundColor: `${priorityColor}15`,
          padding: "2px 6px", borderRadius: 4,
        }}>
          {priority}
        </div>
      </div>
      {isDone && (
        <div style={{
          fontSize: 10, color: "#10B981", marginTop: 4,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          ✓ Completed
        </div>
      )}
    </div>
  );
};

export const KanbanBoard = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{
      display: "flex",
      gap: 12,
      padding: "16px",
      height: "100%",
      overflowX: "hidden",
    }}>
      {COLUMNS.map((col, colIdx) => {
        const colDelay = colIdx * 15;
        const colLocalFrame = Math.max(0, frame - colDelay);
        const colOpacity = interpolate(colLocalFrame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
        const colY = interpolate(colLocalFrame, [0, 25], [30, 0], { extrapolateRight: "clamp" });
        const tasks = TASKS[col.label] || [];

        return (
          <div key={col.label} style={{
            flex: 1,
            opacity: colOpacity,
            transform: `translateY(${colY}px)`,
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Column header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: `1px solid #232D3F`,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                backgroundColor: col.color,
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7C96", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {col.label}
              </div>
              <div style={{
                marginLeft: "auto", fontSize: 10, color: "#6B7C96",
                backgroundColor: "#1A2637", borderRadius: 4, padding: "1px 6px",
              }}>
                {tasks.length}
              </div>
            </div>

            {/* Tasks */}
            {tasks.map((task, taskIdx) => (
              <TaskCard
                key={taskIdx}
                {...task}
                delayFrames={colDelay + taskIdx * 10 + 20}
                isDone={col.label === "Done"}
              />
            ))}

            {/* Column background */}
            <div style={{
              flex: 1,
              backgroundColor: `${col.color}05`,
              border: `1px dashed ${col.color}20`,
              borderRadius: 6,
              minHeight: 40,
            }} />
          </div>
        );
      })}
    </div>
  );
};
