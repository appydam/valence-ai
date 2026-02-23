// CityFloor.tsx — Dark asphalt base with neon grid streets

import { PLOT_SIZE, STREET_WIDTH, PLOTS_PER_ROW, DISTRICTS } from "./cityConfig";

interface CityFloorProps {
  cityWidth: number;
  cityHeight: number;
}

export function CityFloor({ cityWidth, cityHeight }: CityFloorProps) {
  const gridSpacing = PLOT_SIZE + STREET_WIDTH;

  // Generate crosswalk stripe positions at district boundaries
  const crosswalkY: number[] = [];
  DISTRICTS.forEach((_, i) => {
    if (i > 0) crosswalkY.push(i * (PLOT_SIZE * 2.5 + 50));
  });

  return (
    <div
      className="absolute inset-0"
      style={{ width: cityWidth + 120, height: cityHeight + 120 }}
    >
      {/* Base asphalt */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(3, 5, 18, 1)",
        }}
      />

      {/* Primary neon grid (streets) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,220,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,220,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSpacing}px ${gridSpacing}px`,
          backgroundPosition: "0 0",
        }}
      />

      {/* Secondary micro grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,150,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,150,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "22px 22px",
        }}
      />

      {/* District separator lines — brighter horizontal lines between districts */}
      {crosswalkY.map((y, i) => (
        <div key={i}>
          {/* Main separator */}
          <div
            className="absolute"
            style={{
              left: 0,
              top: y - 2,
              width: "100%",
              height: 2,
              background: "rgba(0,200,255,0.15)",
              boxShadow: "0 0 12px rgba(0,200,255,0.2), 0 0 40px rgba(0,200,255,0.05)",
            }}
          />
          {/* Crosswalk dashes */}
          {Array.from({ length: Math.ceil((cityWidth + 120) / 16) }, (_, j) => (
            <div
              key={j}
              className="absolute"
              style={{
                left: j * 16,
                top: y - 10,
                width: 8,
                height: 4,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      ))}

      {/* Vertical street highlight lines */}
      {Array.from({ length: PLOTS_PER_ROW - 1 }, (_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: (i + 1) * gridSpacing - STREET_WIDTH / 2,
            top: 0,
            width: 1,
            height: "100%",
            background: "rgba(0,200,255,0.04)",
          }}
        />
      ))}

      {/* Radial center glow */}
      <div
        className="absolute"
        style={{
          left: "50%",
          top: "30%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(0,100,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Ground-level horizon glow */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 80,
          background: "linear-gradient(to top, rgba(0,150,255,0.04), transparent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
