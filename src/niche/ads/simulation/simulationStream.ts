import { useState, useEffect, useRef } from "react";
import { SIM_STREAM_ITEMS, type SimStreamItem } from "./simulationData";

export interface VisibleStreamItem extends SimStreamItem {
  id: string;
  timestamp: number;
  visible: boolean;
}

/**
 * Hook that progressively reveals execution stream items with realistic timing.
 * Returns a growing array of visible items.
 */
export function useSimulatedStream(active: boolean) {
  const [visibleItems, setVisibleItems] = useState<VisibleStreamItem[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      setVisibleItems([]);
      return;
    }

    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisibleItems([]);
    startTimeRef.current = Date.now();

    // Schedule each item
    SIM_STREAM_ITEMS.forEach((item, index) => {
      const timer = setTimeout(() => {
        const visibleItem: VisibleStreamItem = {
          ...item,
          id: `sim-stream-${index}`,
          timestamp: startTimeRef.current + item.delayMs,
          visible: true,
        };

        setVisibleItems((prev) => [...prev, visibleItem]);

        // For api_call items, simulate the "calling → success" transition
        if (item.type === "api_call" && item.status === "success") {
          // Initially show as "calling"
          setVisibleItems((prev) =>
            prev.map((i) =>
              i.id === `sim-stream-${index}` ? { ...i, status: "calling" as const } : i
            )
          );

          // Then flip to "success" after a delay
          const successTimer = setTimeout(() => {
            setVisibleItems((prev) =>
              prev.map((i) =>
                i.id === `sim-stream-${index}` ? { ...i, status: "success" as const } : i
              )
            );
          }, item.durationMs || 300);

          timersRef.current.push(successTimer);
        }
      }, item.delayMs);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [active]);

  return {
    visibleItems,
    isComplete: visibleItems.length >= SIM_STREAM_ITEMS.length,
    totalItems: SIM_STREAM_ITEMS.length,
  };
}
