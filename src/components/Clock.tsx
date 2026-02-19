import { useState, useEffect } from "react";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <time
      dateTime={time.toISOString()}
      className="font-mono text-lg text-agent-kaze font-semibold tabular-nums tracking-wide"
      aria-label={`Current time: ${formatTime(time)}`}
    >
      {formatTime(time)}
    </time>
  );
}
