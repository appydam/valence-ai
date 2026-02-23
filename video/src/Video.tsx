import { AbsoluteFill, Sequence } from "remotion";
import { Hook } from "./scenes/Hook";
import { Reveal } from "./scenes/Reveal";
import { AgentSquad } from "./scenes/AgentSquad";
import { Demo } from "./scenes/Demo";
import { Proof } from "./scenes/Proof";
import { CTA } from "./scenes/CTA";

// 60 seconds @ 30fps = 1800 frames
// Act 1: Hook        frames 0–360     (0s–12s)
// Act 2: Reveal      frames 360–660   (12s–22s)
// Act 3: Agent Squad frames 660–960   (22s–32s)
// Act 4: Demo        frames 960–1440  (32s–48s)
// Act 5: Proof       frames 1440–1620 (48s–54s)
// Act 6: CTA         frames 1620–1800 (54s–60s)

export const Video = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#070C18", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sequence from={0} durationInFrames={370}>
        <Hook />
      </Sequence>
      <Sequence from={350} durationInFrames={320}>
        <Reveal />
      </Sequence>
      <Sequence from={660} durationInFrames={300}>
        <AgentSquad />
      </Sequence>
      <Sequence from={960} durationInFrames={480}>
        <Demo />
      </Sequence>
      <Sequence from={1440} durationInFrames={180}>
        <Proof />
      </Sequence>
      <Sequence from={1620} durationInFrames={180}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
