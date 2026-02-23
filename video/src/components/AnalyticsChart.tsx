import { useCurrentFrame, spring, interpolate } from "remotion";

const DATA = [
  { label: "Mon", tasks: 3, color: "#3B82F6" },
  { label: "Tue", tasks: 7, color: "#3B82F6" },
  { label: "Wed", tasks: 5, color: "#3B82F6" },
  { label: "Thu", tasks: 11, color: "#3B82F6" },
  { label: "Fri", tasks: 9, color: "#3B82F6" },
  { label: "Sat", tasks: 14, color: "#10B981" },
  { label: "Sun", tasks: 18, color: "#10B981" },
];

const MAX_TASKS = 20;
const CHART_HEIGHT = 200;
const BAR_WIDTH = 48;

export const AnalyticsChart = () => {
  const frame = useCurrentFrame();

  return (
    <div style={{ padding: "20px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          Tasks Completed
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#FFFFFF" }}>68</div>
        <div style={{ fontSize: 12, color: "#10B981", marginTop: 2 }}>↑ 42% vs last week</div>
      </div>

      {/* Chart */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        height: CHART_HEIGHT,
        borderBottom: "1px solid #232D3F",
        paddingBottom: 0,
        position: "relative",
      }}>
        {/* Y-axis gridlines */}
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <div key={pct} style={{
            position: "absolute",
            left: 0, right: 0,
            bottom: pct * CHART_HEIGHT,
            borderTop: "1px dashed #232D3F",
          }} />
        ))}

        {DATA.map((bar, idx) => {
          const delayFrames = idx * 8;
          const barHeight = spring({
            fps: 30,
            frame: Math.max(0, frame - delayFrames),
            config: { damping: 14, stiffness: 100 },
            from: 0,
            to: (bar.tasks / MAX_TASKS) * CHART_HEIGHT,
          });

          const opacity = interpolate(Math.max(0, frame - delayFrames), [0, 15], [0, 1], { extrapolateRight: "clamp" });

          return (
            <div key={bar.label} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              opacity,
              flex: 1,
            }}>
              {/* Bar value */}
              <div style={{ fontSize: 11, fontWeight: 700, color: bar.color }}>{bar.tasks}</div>

              {/* Bar */}
              <div style={{
                width: BAR_WIDTH,
                height: barHeight,
                backgroundColor: bar.color,
                borderRadius: "4px 4px 0 0",
                opacity: 0.85,
                boxShadow: `0 0 12px ${bar.color}40`,
                position: "relative",
              }}>
                {/* Shimmer top */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 4,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: "4px 4px 0 0",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div style={{ display: "flex", gap: 10, marginTop: 8, paddingLeft: 0 }}>
        {DATA.map((bar) => (
          <div key={bar.label} style={{
            flex: 1,
            textAlign: "center",
            fontSize: 10,
            color: "#6B7C96",
            fontWeight: 600,
          }}>
            {bar.label}
          </div>
        ))}
      </div>

      {/* Agent breakdown */}
      <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
        {[
          { name: "Kaze", count: 12, color: "#3B82F6" },
          { name: "Scout", count: 20, color: "#10B981" },
          { name: "Forge", count: 18, color: "#F59E0B" },
          { name: "Ghost", count: 18, color: "#A78BFA" },
        ].map((agent) => {
          const agentOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={agent.name} style={{ display: "flex", alignItems: "center", gap: 6, opacity: agentOpacity }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: agent.color }} />
              <div style={{ fontSize: 11, color: "#6B7C96" }}>{agent.name}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: agent.color }}>{agent.count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
