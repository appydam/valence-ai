import { AbsoluteFill, useCurrentFrame, interpolate, Sequence } from "remotion";
import { Background } from "../components/Background";
import { BrowserFrame } from "../components/BrowserFrame";
import { KanbanBoard } from "../components/KanbanBoard";
import { IntegrationGrid } from "../components/IntegrationGrid";
import { AnalyticsChart } from "../components/AnalyticsChart";

// Demo acts (local frames within the Demo sequence which runs 480 frames)
// Act A: Kanban Board   0–180
// Act B: Integrations   160–340  (20 frame overlap for crossfade)
// Act C: Analytics      320–480  (20 frame overlap)

const LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  bottom: -48,
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 13,
  color: "#6B7C96",
  fontWeight: 600,
  whiteSpace: "nowrap",
  fontFamily: "JetBrains Mono, monospace",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const Caption = ({ text, startFrame }: { text: string; startFrame: number }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], { extrapolateRight: "clamp" });
  const y = interpolate(frame, [startFrame, startFrame + 20], [10, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute",
      top: 40,
      left: "50%",
      transform: `translateX(-50%) translateY(${y}px)`,
      opacity,
      backgroundColor: "#0F1622",
      border: "1px solid #232D3F",
      borderRadius: 100,
      padding: "6px 20px",
      fontSize: 13,
      color: "#FFFFFF",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {text}
    </div>
  );
};

export const Demo = () => {
  const frame = useCurrentFrame();

  // Kanban visible frames 0–180, fades out 160–190
  const kanbanOpacity = interpolate(frame, [0, 20, 160, 190], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Integrations visible 160–340, fades in 160–190, out 320–350
  const integrationsOpacity = interpolate(frame, [160, 190, 320, 350], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Analytics visible 320–480
  const analyticsOpacity = interpolate(frame, [320, 350], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const kanbanScale = interpolate(frame, [0, 20], [0.96, 1], { extrapolateRight: "clamp" });
  const intScale = interpolate(frame, [160, 190], [0.96, 1], { extrapolateRight: "clamp" });
  const analyticsScale = interpolate(frame, [320, 350], [0.96, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Background variant="default" />

      <AbsoluteFill style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        {/* KANBAN */}
        <div style={{
          position: "absolute",
          opacity: kanbanOpacity,
          transform: `scale(${kanbanScale})`,
        }}>
          <BrowserFrame url="app.missioncontrol.ai/board" width={1300} height={660}>
            <Sequence from={0} durationInFrames={180} layout="none">
              <KanbanBoard />
            </Sequence>
          </BrowserFrame>
          <Caption text="Mission Board — Real-time Kanban" startFrame={20} />
        </div>

        {/* INTEGRATIONS */}
        <div style={{
          position: "absolute",
          opacity: integrationsOpacity,
          transform: `scale(${intScale})`,
        }}>
          <BrowserFrame url="app.missioncontrol.ai/integrations" width={1300} height={660}>
            <div style={{ padding: "16px 0 0 0" }}>
              {/* Sub-header */}
              <div style={{ padding: "0 16px 12px 16px", borderBottom: "1px solid #232D3F", marginBottom: 4 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", marginBottom: 4 }}>
                  Integration Engine
                </div>
                <div style={{ fontSize: 12, color: "#6B7C96" }}>
                  Connect any API. No developer needed.
                </div>
              </div>
              <Sequence from={0} durationInFrames={180} layout="none">
                <IntegrationGrid />
              </Sequence>
              {/* Callout */}
              <div style={{
                margin: "8px 16px 0",
                padding: "10px 16px",
                backgroundColor: "#10B98110",
                border: "1px solid #10B98130",
                borderRadius: 8,
                fontSize: 13,
                color: "#10B981",
                fontWeight: 600,
              }}>
                ✓ Any API. One blueprint. Zero code. — Replaces Paragon ($2,500/mo → $0)
              </div>
            </div>
          </BrowserFrame>
          <Caption text="Universal Integration Engine" startFrame={0} />
        </div>

        {/* ANALYTICS */}
        <div style={{
          position: "absolute",
          opacity: analyticsOpacity,
          transform: `scale(${analyticsScale})`,
        }}>
          <BrowserFrame url="app.missioncontrol.ai/analytics" width={1300} height={660}>
            <div style={{ padding: "16px 0 0 0" }}>
              <div style={{ padding: "0 24px 12px", borderBottom: "1px solid #232D3F", display: "flex", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Active Agents</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#3B82F6" }}>4</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Tasks This Week</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#10B981" }}>68</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>API Calls Today</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B" }}>1,247</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6B7C96", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Integrations Live</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "#A78BFA" }}>12</div>
                </div>
              </div>
              <Sequence from={0} durationInFrames={160} layout="none">
                <AnalyticsChart />
              </Sequence>
            </div>
          </BrowserFrame>
          <Caption text="Analytics — Full Squad Performance" startFrame={0} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
