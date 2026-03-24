import { useState, useEffect, useRef } from "react";

const SIM_PROMPT = "Launch a summer sale campaign for MAISON across Google Ads and Instagram with $200/day budget";

/**
 * Hook that simulates typing a prompt character by character.
 * Returns the current visible text, whether typing is done, and whether the "submit" animation is done.
 */
export function useAutoTypePrompt(active: boolean) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayText("");
      setIsTyping(false);
      setIsTypingDone(false);
      setIsSubmitted(false);
      indexRef.current = 0;
      return;
    }

    // Start typing after a brief delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      indexRef.current = 0;

      const typeNext = () => {
        if (indexRef.current < SIM_PROMPT.length) {
          indexRef.current++;
          setDisplayText(SIM_PROMPT.slice(0, indexRef.current));
          // Variable speed: faster for common chars, slight pause on spaces/punctuation
          const char = SIM_PROMPT[indexRef.current - 1];
          const delay = char === " " ? 60 : char === "," || char === "/" ? 80 : 30 + Math.random() * 25;
          timerRef.current = setTimeout(typeNext, delay);
        } else {
          // Typing complete — pause briefly, then "submit"
          setIsTypingDone(true);
          timerRef.current = setTimeout(() => {
            setIsSubmitted(true);
          }, 800);
        }
      };

      typeNext();
    }, 600);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active]);

  return {
    displayText,
    fullText: SIM_PROMPT,
    isTyping,
    isTypingDone,
    isSubmitted,
  };
}
