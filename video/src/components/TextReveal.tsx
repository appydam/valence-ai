import { useCurrentFrame, interpolate } from "remotion";

interface TextRevealProps {
  text: string;
  startFrame?: number;
  durationFrames?: number;
  style?: React.CSSProperties;
  mode?: "chars" | "words" | "fade";
}

export const TextReveal = ({
  text,
  startFrame = 0,
  durationFrames = 60,
  style = {},
  mode = "chars",
}: TextRevealProps) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);

  if (mode === "fade") {
    const opacity = interpolate(localFrame, [0, durationFrames * 0.5], [0, 1], {
      extrapolateRight: "clamp",
    });
    const translateY = interpolate(localFrame, [0, durationFrames * 0.5], [20, 0], {
      extrapolateRight: "clamp",
    });
    return (
      <div style={{ opacity, transform: `translateY(${translateY}px)`, ...style }}>
        {text}
      </div>
    );
  }

  if (mode === "words") {
    const words = text.split(" ");
    return (
      <div style={style}>
        {words.map((word, idx) => {
          const wordStart = (idx / words.length) * durationFrames;
          const wordOpacity = interpolate(localFrame, [wordStart, wordStart + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const wordY = interpolate(localFrame, [wordStart, wordStart + 15], [10, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                opacity: wordOpacity,
                transform: `translateY(${wordY}px)`,
                marginRight: "0.25em",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    );
  }

  // Default: character-by-character typewriter
  const charsToShow = Math.floor(
    interpolate(localFrame, [0, durationFrames], [0, text.length], {
      extrapolateRight: "clamp",
    })
  );
  const cursor = localFrame < durationFrames + 10 && localFrame % 20 < 10;

  return (
    <div style={style}>
      {text.substring(0, charsToShow)}
      {cursor && <span style={{ opacity: 0.8 }}>|</span>}
    </div>
  );
};
