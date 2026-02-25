import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const COMMANDS = [
  { text: "Launch our product on Product Hunt", response: "Kaze: Delegating → Scout → Ghost → Forge..." },
  { text: "Prepare Q1 board presentation", response: "Kaze: Creating mission plan, assigning agents..." },
  { text: "Review the GitHub PR from this morning", response: "Sentinel: Analyzing diff, Forge: Code review in progress..." },
  { text: "Research our top 3 competitors' pricing", response: "Scout: Scanning markets, compiling intelligence..." },
];

export function TypingCommand() {
  const prefersReduced = useReducedMotion();
  const [cmdIndex, setCmdIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "hold" | "deleting" | "response" | "responsefade">("typing");
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setTyped(COMMANDS[0].text);
      setShowResponse(true);
      return;
    }

    const cmd = COMMANDS[cmdIndex].text;
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (typed.length < cmd.length) {
        timeout = setTimeout(() => setTyped(cmd.slice(0, typed.length + 1)), 40);
      } else {
        timeout = setTimeout(() => setPhase("response"), 200);
      }
    } else if (phase === "response") {
      setShowResponse(true);
      timeout = setTimeout(() => setPhase("hold"), 1800);
    } else if (phase === "hold") {
      timeout = setTimeout(() => {
        setShowResponse(false);
        setPhase("deleting");
      }, 800);
    } else if (phase === "deleting") {
      if (typed.length > 0) {
        timeout = setTimeout(() => setTyped(typed.slice(0, -1)), 18);
      } else {
        const next = (cmdIndex + 1) % COMMANDS.length;
        setCmdIndex(next);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [phase, typed, cmdIndex, prefersReduced]);

  const currentCmd = COMMANDS[cmdIndex];

  return (
    <div className="font-mono text-sm space-y-2 text-left">
      <div className="flex items-center gap-2 text-muted-foreground/60">
        <span className="text-primary/50 select-none">❯</span>
        <span className="text-foreground/80">{typed}</span>
        <span className="w-[2px] h-[1.1em] bg-primary animate-data-blink inline-block align-middle" />
      </div>
      <div
        className="flex items-center gap-2 text-xs transition-opacity duration-300"
        style={{ opacity: showResponse ? 1 : 0 }}
      >
        <span className="text-primary/40 select-none">↳</span>
        <span className="text-primary/70 animate-data-blink">{currentCmd.response}</span>
      </div>
    </div>
  );
}
