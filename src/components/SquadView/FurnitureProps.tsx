import { WorkZone as WorkZoneType, worldToScreen } from "./worldConfig";

interface FurniturePropsProps {
  zone: WorkZoneType;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
}

export function FurnitureProps({ zone, containerWidth, containerHeight, isActive }: FurniturePropsProps) {
  const screen = worldToScreen(zone.wx, zone.wy, containerWidth, containerHeight);
  const s = screen.scale;
  const opacity = isActive ? 0.7 : 0.35;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: screen.sx,
    top: screen.sy,
    transform: "translate(-50%, -50%) scaleY(0.5)",
    zIndex: screen.zIndex - 1,
    opacity,
    transition: "opacity 0.5s ease",
    pointerEvents: "none" as const,
  };

  const borderColor = `hsl(var(--agent-${zone.color}) / ${isActive ? 0.5 : 0.2})`;
  const fillColor = `hsl(var(--agent-${zone.color}) / ${isActive ? 0.1 : 0.04})`;
  const glowShadow = isActive ? `0 0 8px hsl(var(--agent-${zone.color}) / 0.25), inset 0 0 6px hsl(var(--agent-${zone.color}) / 0.08)` : "none";

  switch (zone.id) {
    case "command-deck":
      return (
        <div style={baseStyle}>
          <div
            style={{
              width: 100 * s,
              height: 30 * s,
              border: `1px solid ${borderColor}`,
              borderRadius: 4 * s,
              backgroundColor: fillColor,
              boxShadow: glowShadow,
              position: "relative",
            }}
          >
            {/* Two monitors with animated screen bars */}
            {[15, undefined].map((leftVal, idx) => (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  top: -20 * s,
                  ...(idx === 0 ? { left: 12 * s } : { right: 12 * s }),
                  width: 30 * s,
                  height: 18 * s,
                  border: `1px solid ${borderColor}`,
                  borderRadius: 2 * s,
                  backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.15 : 0.05})`,
                  boxShadow: isActive ? `0 0 6px hsl(var(--agent-${zone.color}) / 0.2)` : "none",
                  overflow: "hidden",
                }}
              >
                {/* Animated screen data lines */}
                {isActive &&
                  [0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="animate-hud-shimmer"
                      style={{
                        position: "absolute",
                        top: (3 + i * 4) * s,
                        left: 3 * s,
                        width: (20 - i * 3) * s,
                        height: 1.5 * s,
                        backgroundImage: `linear-gradient(90deg, transparent, hsl(var(--agent-${zone.color}) / 0.5), transparent)`,
                        backgroundSize: "200% 100%",
                        borderRadius: 1,
                        animationDelay: `${i * 0.4}s`,
                      }}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      );

    case "research-lab":
      return (
        <div style={baseStyle}>
          <div
            style={{
              width: 90 * s,
              height: 35 * s,
              border: `1px solid ${borderColor}`,
              borderRadius: `${50 * s}px ${50 * s}px ${6 * s}px ${6 * s}px`,
              backgroundColor: fillColor,
              boxShadow: glowShadow,
              position: "relative",
            }}
          >
            {/* Large data screen with scanner sweep */}
            <div
              style={{
                position: "absolute",
                top: -24 * s,
                left: "50%",
                transform: "translateX(-50%)",
                width: 52 * s,
                height: 22 * s,
                border: `1px solid ${borderColor}`,
                borderRadius: 3 * s,
                backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.18 : 0.06})`,
                boxShadow: isActive ? `0 0 10px hsl(var(--agent-${zone.color}) / 0.2)` : "none",
                overflow: "hidden",
              }}
            >
              {/* Data lines with animated widths */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={isActive ? "animate-hud-shimmer" : ""}
                  style={{
                    position: "absolute",
                    top: (3 + i * 5) * s,
                    left: 4 * s,
                    width: (32 - i * 5) * s,
                    height: 1.5 * s,
                    backgroundImage: isActive
                      ? `linear-gradient(90deg, hsl(var(--agent-${zone.color}) / 0.4), hsl(var(--agent-${zone.color}) / 0.6), hsl(var(--agent-${zone.color}) / 0.4))`
                      : "none",
                    backgroundColor: isActive ? "transparent" : borderColor,
                    backgroundSize: "200% 100%",
                    borderRadius: 1,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
              {/* Scanner sweep line */}
              {isActive && (
                <div
                  className="absolute left-0 right-0 h-[1px] animate-scan-sweep"
                  style={{
                    background: `linear-gradient(90deg, transparent, hsl(var(--agent-${zone.color}) / 0.4), transparent)`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      );

    case "workshop":
      return (
        <div style={baseStyle}>
          <div
            style={{
              width: 110 * s,
              height: 28 * s,
              border: `1px solid ${borderColor}`,
              borderRadius: 3 * s,
              backgroundColor: fillColor,
              boxShadow: glowShadow,
              position: "relative",
            }}
          >
            {/* Server rack with blinking LEDs */}
            <div
              style={{
                position: "absolute",
                top: -42 * s,
                right: -22 * s,
                width: 24 * s,
                height: 40 * s,
                border: `1px solid ${borderColor}`,
                borderRadius: 2 * s,
                backgroundColor: `hsl(var(--agent-${zone.color}) / ${isActive ? 0.1 : 0.04})`,
                boxShadow: isActive ? `0 0 6px hsl(var(--agent-${zone.color}) / 0.15)` : "none",
              }}
            >
              {/* Rack lines + LED dots */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div
                    style={{
                      position: "absolute",
                      top: (5 + i * 7) * s,
                      left: 3 * s,
                      width: 18 * s,
                      height: 1 * s,
                      backgroundColor: borderColor,
                    }}
                  />
                  {/* LED dot */}
                  {isActive && (
                    <div
                      className="animate-data-blink"
                      style={{
                        position: "absolute",
                        top: (4 + i * 7) * s,
                        right: 3 * s,
                        width: 2.5 * s,
                        height: 2.5 * s,
                        borderRadius: "50%",
                        backgroundColor: `hsl(var(--agent-${zone.color}))`,
                        boxShadow: `0 0 4px hsl(var(--agent-${zone.color}) / 0.6)`,
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "comms-hub":
      return (
        <div style={baseStyle}>
          <div
            style={{
              width: 80 * s,
              height: 40 * s,
              borderBottom: `1px solid ${borderColor}`,
              borderLeft: `1px solid ${borderColor}`,
              borderRight: `1px solid ${borderColor}`,
              borderRadius: `0 0 ${40 * s}px ${40 * s}px`,
              backgroundColor: fillColor,
              boxShadow: glowShadow,
              position: "relative",
            }}
          >
            {/* Antenna */}
            <div
              style={{
                position: "absolute",
                top: -32 * s,
                left: "50%",
                transform: "translateX(-50%)",
                width: 2 * s,
                height: 30 * s,
                backgroundColor: borderColor,
              }}
            >
              {/* Antenna tip with glow */}
              <div
                style={{
                  position: "absolute",
                  top: -4 * s,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 7 * s,
                  height: 7 * s,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? `hsl(var(--agent-${zone.color}) / 0.7)`
                    : borderColor,
                  boxShadow: isActive
                    ? `0 0 8px hsl(var(--agent-${zone.color}) / 0.5), 0 0 16px hsl(var(--agent-${zone.color}) / 0.25)`
                    : "none",
                }}
              />
              {/* Signal rings (expanding outward) */}
              {isActive &&
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="absolute rounded-full animate-signal-ring"
                    style={{
                      top: -8 * s,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 12 * s,
                      height: 12 * s,
                      border: `1px solid hsl(var(--agent-${zone.color}) / 0.3)`,
                      animationDelay: `${i * 0.6}s`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      );

    case "war-room":
      return (
        <div style={baseStyle}>
          {/* Oval meeting table with holographic surface */}
          <div
            style={{
              width: 120 * s,
              height: 50 * s,
              border: `1px solid ${borderColor}`,
              borderRadius: "50%",
              backgroundColor: fillColor,
              boxShadow: glowShadow,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Holographic dot grid on table surface */}
            {isActive && (
              <div
                className="absolute inset-0 animate-zone-pulse"
                style={{
                  backgroundImage: `radial-gradient(circle, hsl(var(--agent-${zone.color}) / 0.3) 1px, transparent 1px)`,
                  backgroundSize: `${8 * s}px ${8 * s}px`,
                  borderRadius: "50%",
                }}
              />
            )}
          </div>
        </div>
      );

    case "inbox":
      return (
        <div style={baseStyle}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: (72 - i * 4) * s,
                height: 9 * s,
                border: `1px solid hsl(var(--muted-foreground) / ${isActive ? 0.3 : 0.12})`,
                borderRadius: 2 * s,
                backgroundColor: `hsl(var(--muted-foreground) / ${isActive ? 0.08 : 0.03})`,
                boxShadow: isActive && i === 0
                  ? "0 0 6px hsl(var(--agent-kaze) / 0.15)"
                  : "none",
                marginBottom: 3 * s,
              }}
            />
          ))}
        </div>
      );

    default:
      return null;
  }
}
