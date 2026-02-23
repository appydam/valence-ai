// WeatherSystem.tsx — Environmental effects tied to operational data
// Calm (0-1 working) = sunlight, Active (2) = mist, Storm (3+) = rain + lightning

import { useMemo } from "react";

interface WeatherSystemProps {
  workingCount: number;
  containerWidth: number;
  containerHeight: number;
}

export function WeatherSystem({ workingCount, containerWidth, containerHeight }: WeatherSystemProps) {
  const isCalm = workingCount <= 1;
  const isActive = workingCount === 2;
  const isStorm = workingCount >= 3;

  // Generate rain drops for storm mode
  const rainDrops = useMemo(() => {
    if (!isStorm) return [];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: (i / 18) * 100 + Math.sin(i * 2.7) * 5,
      height: 12 + (i % 4) * 4,
      delay: (i * 0.07) % 0.5,
      duration: 0.4 + (i % 3) * 0.1,
    }));
  }, [isStorm]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Sunlight rays — visible during calm */}
      <div
        className="transition-opacity duration-1000"
        style={{ opacity: isCalm ? 1 : 0 }}
      >
        {/* Main sun ray */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "35%",
            width: "30%",
            height: "70%",
            background: "linear-gradient(180deg, rgba(255,240,180,0.06) 0%, transparent 100%)",
            transform: "rotate(-5deg)",
            transformOrigin: "top center",
          }}
        />
        {/* Secondary ray */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "55%",
            width: "20%",
            height: "55%",
            background: "linear-gradient(180deg, rgba(255,240,180,0.04) 0%, transparent 100%)",
            transform: "rotate(8deg)",
            transformOrigin: "top center",
          }}
        />
      </div>

      {/* Thickened mist — during active/storm */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: isActive ? 0.8 : isStorm ? 1 : 0,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 120% 40% at 40% 50%, rgba(200,230,200,0.06) 0%, transparent 60%)",
            animation: "mist-drift 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 100% 35% at 65% 45%, rgba(180,220,200,0.05) 0%, transparent 55%)",
            animation: "mist-drift 10s ease-in-out 3s infinite",
          }}
        />
      </div>

      {/* Rain — storm only */}
      {isStorm && (
        <div className="absolute inset-0 overflow-hidden">
          {rainDrops.map((drop) => (
            <div
              key={drop.id}
              style={{
                position: "absolute",
                left: `${drop.x}%`,
                top: -20,
                width: 1,
                height: drop.height,
                background: "linear-gradient(180deg, transparent, rgba(200,220,255,0.15))",
                animation: `rain-fall ${drop.duration}s linear ${drop.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Lightning flash — storm only */}
      {isStorm && (
        <div
          className="absolute inset-0"
          style={{
            background: "rgba(255,255,255,0.04)",
            animation: "lightning-flash 5s linear infinite",
          }}
        />
      )}

      {/* Storm darkening overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: "rgba(0,0,0,0.15)",
          opacity: isStorm ? 1 : 0,
        }}
      />
    </div>
  );
}
