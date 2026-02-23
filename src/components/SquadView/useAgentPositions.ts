import { useState, useEffect, useRef, useMemo } from "react";
import { AgentName, AGENT_CONFIG } from "@/types/mission";
import {
  AgentMovementState,
  WorldPosition,
  ZONES,
  AGENT_HOME_ZONE,
  getAgentTargetZone,
  getWalkDuration,
  getZoneStandPosition,
  getZoneById,
} from "./worldConfig";

interface AgentData {
  name: AgentName;
  status: string;
  tasksCompleted: number;
  lastHeartbeat: number;
}

interface TaskData {
  _id: string;
  assignee?: string;
  status: string;
}

interface ActivityData {
  _id: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: number;
}

const AGENT_NAMES: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];
const ZONE_CHANGE_DEBOUNCE = 1000; // ms before committing to a zone change

function getInitialPositions(): Record<AgentName, AgentMovementState> {
  const result: Record<string, AgentMovementState> = {};
  for (const name of AGENT_NAMES) {
    const homeZoneId = AGENT_HOME_ZONE[name];
    const zone = getZoneById(homeZoneId)!;
    const pos = getZoneStandPosition(zone, name);
    result[name] = {
      name,
      currentPosition: pos,
      targetPosition: pos,
      targetZoneId: homeZoneId,
      movementState: "idle",
      facingDirection: "right",
      walkDuration: 0,
      isMoving: false,
    };
  }
  return result as Record<AgentName, AgentMovementState>;
}

export function useAgentPositions(
  agents: AgentData[],
  tasks: TaskData[],
  activity: ActivityData[]
): AgentMovementState[] {
  const [positions, setPositions] = useState<Record<AgentName, AgentMovementState>>(getInitialPositions);
  const pendingZoneChanges = useRef<Record<string, NodeJS.Timeout>>({});
  const walkTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Detect collaborations from recent activity
  const collaboratingAgents = useMemo(() => {
    const collabs = new Set<AgentName>();
    const now = Date.now();
    for (const entry of activity) {
      if (now - entry.timestamp > 30000) continue; // only last 30s
      if (
        entry.action.includes("delegat") ||
        entry.action.includes("review") ||
        entry.action.includes("assign")
      ) {
        collabs.add(entry.agentName as AgentName);
        // Try to extract mentioned agent from details
        for (const name of AGENT_NAMES) {
          if (entry.details.includes(name)) {
            collabs.add(name);
          }
        }
      }
    }
    return collabs;
  }, [activity]);

  // React to Convex data changes → compute target zones → trigger walks
  useEffect(() => {
    for (const name of AGENT_NAMES) {
      const agentData = agents.find((a) => a.name === name);
      const status = agentData?.status ?? "offline";

      const activeTask = tasks.find(
        (t) => t.assignee === name && (t.status === "in_progress" || t.status === "in_review")
      );
      const currentTaskStatus = activeTask?.status ?? null;
      const isCollaborating = collaboratingAgents.has(name);

      const newTargetZoneId = getAgentTargetZone(name, status, currentTaskStatus, isCollaborating);

      setPositions((prev) => {
        const current = prev[name];
        if (!current) return prev;

        // Derive movement state (without changing position)
        const newMovementState =
          status === "offline"
            ? "offline"
            : isCollaborating
              ? "talking"
              : status === "working" || status === "online"
                ? "working"
                : "idle";

        // If target zone hasn't changed, just update the movement state
        if (current.targetZoneId === newTargetZoneId) {
          if (current.movementState !== newMovementState && !current.isMoving) {
            return {
              ...prev,
              [name]: { ...current, movementState: newMovementState },
            };
          }
          return prev;
        }

        // Target zone changed — debounce before committing
        if (pendingZoneChanges.current[name]) {
          clearTimeout(pendingZoneChanges.current[name]);
        }

        pendingZoneChanges.current[name] = setTimeout(() => {
          setPositions((prevInner) => {
            const currentInner = prevInner[name];
            if (!currentInner) return prevInner;

            const targetZone = getZoneById(newTargetZoneId);
            if (!targetZone) return prevInner;

            const targetPos = getZoneStandPosition(targetZone, name);
            const from = currentInner.currentPosition;
            const walkDuration = getWalkDuration(from, targetPos);
            const dx = targetPos.wx - from.wx;

            // Start walk
            const updated: AgentMovementState = {
              ...currentInner,
              targetPosition: targetPos,
              targetZoneId: newTargetZoneId,
              movementState: "walking",
              facingDirection: dx >= 0 ? "right" : "left",
              walkDuration,
              isMoving: true,
            };

            // Set timer to complete the walk
            if (walkTimers.current[name]) clearTimeout(walkTimers.current[name]);
            walkTimers.current[name] = setTimeout(() => {
              setPositions((p) => {
                const agent = p[name];
                if (!agent) return p;
                return {
                  ...p,
                  [name]: {
                    ...agent,
                    currentPosition: agent.targetPosition,
                    isMoving: false,
                    movementState: newMovementState,
                  },
                };
              });
            }, walkDuration);

            return { ...prevInner, [name]: updated };
          });
        }, ZONE_CHANGE_DEBOUNCE);

        return prev; // don't update yet — debounce handles it
      });
    }

    // Cleanup
    return () => {
      for (const timer of Object.values(pendingZoneChanges.current)) clearTimeout(timer);
    };
  }, [agents, tasks, collaboratingAgents]);

  // Cleanup walk timers on unmount
  useEffect(() => {
    return () => {
      for (const timer of Object.values(walkTimers.current)) clearTimeout(timer);
    };
  }, []);

  return useMemo(() => Object.values(positions), [positions]);
}
