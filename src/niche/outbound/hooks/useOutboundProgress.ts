import { useMemo } from "react";
import { useUserTasks } from "@/hooks/useUserScoped";
import { useIntegrationCall } from "../../framework/useIntegrationCall";

export interface StageProgress {
  key: string;
  label: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  completed: boolean;
  active: boolean;
  taskCount: number;
  completedTaskCount: number;
  xp: number;
}

export interface OutboundProgress {
  stages: StageProgress[];
  totalXp: number;
  level: number;
  levelName: string;
  completionPct: number;
  integrationsConnected: number;
  integrationsRequired: number;
  campaignsLaunched: number;
  isReady: boolean;
}

const LEVELS = [
  { min: 0, name: "Rookie" },
  { min: 50, name: "Prospector" },
  { min: 150, name: "Pipeline Builder" },
  { min: 300, name: "Outbound Pro" },
  { min: 500, name: "Deal Machine" },
  { min: 1000, name: "Revenue Engine" },
];

export function useOutboundProgress(): OutboundProgress {
  const tasks = useUserTasks();
  const { isConnected } = useIntegrationCall();

  return useMemo(() => {
    const outboundTasks = (tasks ?? []).filter(
      (t: { tags?: string[] }) => t.tags?.includes("niche:outbound")
    );

    const hasIntegration = (slug: string) => isConnected(slug);
    const integrationsConnected = ["apollo", "hunter", "clay", "hubspot", "lagrowthmachine", "gmail"].filter(hasIntegration).length;

    const countStage = (stageKey: string) => {
      const stageTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes(`stage:${stageKey}`));
      const done = stageTasks.filter((t: { status: string }) => t.status === "done").length;
      return { total: stageTasks.length, done };
    };

    const companies = countStage("companies");
    const contacts = countStage("contacts");
    const enriched = countStage("enriched");
    const crm = countStage("crm");
    const sequences = countStage("sequences");

    const displacementTasks = outboundTasks.filter((t: { tags?: string[] }) => t.tags?.includes("competitor-displacement"));
    const campaignsLaunched = outboundTasks.filter((t: { tags?: string[] }) =>
      t.tags?.includes("mission:full-pipeline") || t.tags?.includes("mission:displacement")
    ).length;

    const stages: StageProgress[] = [
      {
        key: "connect",
        label: "Connect Tools",
        description: "Link Apollo, HubSpot, Clay, and LaGrowthMachine",
        emoji: "🔌",
        unlocked: true,
        completed: integrationsConnected >= 2,
        active: integrationsConnected < 2,
        taskCount: 0,
        completedTaskCount: integrationsConnected,
        xp: integrationsConnected * 10,
      },
      {
        key: "companies",
        label: "Source Companies",
        description: "Upload a CSV or let Scout find target companies via Apollo",
        emoji: "🏢",
        unlocked: integrationsConnected >= 1,
        completed: companies.done > 0,
        active: companies.total > 0 && companies.done === 0,
        taskCount: companies.total,
        completedTaskCount: companies.done,
        xp: companies.done * 20,
      },
      {
        key: "contacts",
        label: "Find Contacts",
        description: "Discover decision-makers with verified emails and LinkedIn",
        emoji: "👤",
        unlocked: companies.done > 0 || companies.total > 0,
        completed: contacts.done > 0,
        active: contacts.total > 0 && contacts.done === 0,
        taskCount: contacts.total,
        completedTaskCount: contacts.done,
        xp: contacts.done * 25,
      },
      {
        key: "enriched",
        label: "Enrich Data",
        description: "Clay enrichment: phone numbers, company data, social profiles",
        emoji: "✨",
        unlocked: contacts.done > 0 || contacts.total > 0,
        completed: enriched.done > 0,
        active: enriched.total > 0 && enriched.done === 0,
        taskCount: enriched.total,
        completedTaskCount: enriched.done,
        xp: enriched.done * 25,
      },
      {
        key: "crm",
        label: "Push to CRM",
        description: "Create contacts and lists in HubSpot automatically",
        emoji: "💾",
        unlocked: enriched.done > 0 || enriched.total > 0,
        completed: crm.done > 0,
        active: crm.total > 0 && crm.done === 0,
        taskCount: crm.total,
        completedTaskCount: crm.done,
        xp: crm.done * 30,
      },
      {
        key: "sequences",
        label: "Launch Sequences",
        description: "AI-written email + LinkedIn sequences personalized per contact",
        emoji: "🚀",
        unlocked: crm.done > 0 || crm.total > 0,
        completed: sequences.done > 0,
        active: sequences.total > 0 && sequences.done === 0,
        taskCount: sequences.total,
        completedTaskCount: sequences.done,
        xp: sequences.done * 40,
      },
      {
        key: "displace",
        label: "Competitor Displacement",
        description: "Target competitor's unhappy customers with pain-matched outreach",
        emoji: "⚔️",
        unlocked: true,
        completed: displacementTasks.filter((t: { status: string }) => t.status === "done").length > 0,
        active: displacementTasks.filter((t: { status: string }) => t.status === "in_progress" || t.status === "assigned").length > 0,
        taskCount: displacementTasks.length,
        completedTaskCount: displacementTasks.filter((t: { status: string }) => t.status === "done").length,
        xp: displacementTasks.filter((t: { status: string }) => t.status === "done").length * 50,
      },
    ];

    const totalXp = stages.reduce((s, st) => s + st.xp, 0);
    const level = LEVELS.reduce((lv, l) => (totalXp >= l.min ? l : lv), LEVELS[0]);
    const completedStages = stages.filter((s) => s.completed).length;
    const completionPct = Math.round((completedStages / stages.length) * 100);

    return {
      stages,
      totalXp,
      level: LEVELS.indexOf(level),
      levelName: level.name,
      completionPct,
      integrationsConnected,
      integrationsRequired: 2,
      campaignsLaunched,
      isReady: integrationsConnected >= 2,
    };
  }, [tasks, isConnected]);
}
