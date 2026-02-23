import { useState, useEffect, useMemo, useRef } from "react";
import { AgentName } from "@/types/mission";
import { AgentMovementState } from "./worldConfig";

const AGENT_NAMES: AgentName[] = ["Kaze", "Scout", "Forge", "Ghost"];

interface ActivityData {
  _id: string;
  agentName: string;
  action: string;
  details: string;
  timestamp: number;
}

export interface SpeechBubbleData {
  id: string;
  agentName: AgentName;
  text: string;
  expiresAt: number;
}

export interface NotificationPingData {
  id: string;
  fromAgent: AgentName;
  toAgent: AgentName;
  createdAt: number;
}

export interface DataStreamData {
  id: string;
  agentA: AgentName;
  agentB: AgentName;
}

interface TaskData {
  _id: string;
  assignee?: string;
  status: string;
  missionId?: string;
}

export function useWorldInteractions(
  activity: ActivityData[],
  tasks: TaskData[],
  agentPositions: AgentMovementState[]
) {
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubbleData[]>([]);
  const [notificationPings, setNotificationPings] = useState<NotificationPingData[]>([]);
  const processedActivityIds = useRef(new Set<string>());

  // Process new activity entries → speech bubbles + notification pings
  useEffect(() => {
    const now = Date.now();

    for (const entry of activity) {
      if (processedActivityIds.current.has(entry._id)) continue;
      if (now - entry.timestamp > 15000) continue; // only recent entries

      processedActivityIds.current.add(entry._id);

      const agentName = entry.agentName as AgentName;
      if (!AGENT_NAMES.includes(agentName)) continue;

      // Create speech bubble
      const bubbleText = entry.action.length > 40
        ? entry.action
        : `${entry.action}: ${entry.details}`;

      setSpeechBubbles((prev) => [
        ...prev.slice(-4), // keep max 5 bubbles
        {
          id: entry._id,
          agentName,
          text: bubbleText,
          expiresAt: now + 6000,
        },
      ]);

      // Check for delegation → notification ping
      if (
        entry.action.includes("delegat") ||
        entry.action.includes("assign") ||
        entry.action.includes("handed")
      ) {
        for (const targetName of AGENT_NAMES) {
          if (targetName !== agentName && entry.details.includes(targetName)) {
            setNotificationPings((prev) => [
              ...prev.slice(-2), // max 3 pings
              {
                id: `ping-${entry._id}-${targetName}`,
                fromAgent: agentName,
                toAgent: targetName,
                createdAt: now,
              },
            ]);
          }
        }
      }
    }
  }, [activity]);

  // Expire old speech bubbles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSpeechBubbles((prev) => prev.filter((b) => b.expiresAt > now));
      setNotificationPings((prev) => prev.filter((p) => Date.now() - p.createdAt < 1500));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Data streams: connect agents working on the same mission
  const dataStreams = useMemo<DataStreamData[]>(() => {
    const streams: DataStreamData[] = [];
    const agentMissions: Record<string, AgentName[]> = {};

    for (const task of tasks) {
      if (
        task.assignee &&
        task.status === "in_progress" &&
        task.missionId &&
        AGENT_NAMES.includes(task.assignee as AgentName)
      ) {
        const mId = task.missionId;
        if (!agentMissions[mId]) agentMissions[mId] = [];
        if (!agentMissions[mId].includes(task.assignee as AgentName)) {
          agentMissions[mId].push(task.assignee as AgentName);
        }
      }
    }

    for (const agents of Object.values(agentMissions)) {
      if (agents.length >= 2) {
        // Create pairwise connections (max 3)
        for (let i = 0; i < agents.length && streams.length < 3; i++) {
          for (let j = i + 1; j < agents.length && streams.length < 3; j++) {
            streams.push({
              id: `stream-${agents[i]}-${agents[j]}`,
              agentA: agents[i],
              agentB: agents[j],
            });
          }
        }
      }
    }

    return streams;
  }, [tasks]);

  return { speechBubbles, notificationPings, dataStreams };
}
