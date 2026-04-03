import { useState } from "react";
import { useNiche } from "../../framework/NicheContext";
import { PipelineFlowViz } from "../components/PipelineFlowViz";
import { LiveAgentFeed } from "../components/LiveAgentFeed";
import { IntegrationChain } from "../components/IntegrationChain";
import { StageDetailDrawer } from "../components/StageDetailDrawer";
import { useOutboundPipeline } from "../hooks/useOutboundPipeline";

export function PipelineFlow() {
  const { config } = useNiche();
  const { totalTasks, completedTasks, activeTasks } = useOutboundPipeline();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Live agent feed */}
      <LiveAgentFeed />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
              <p className="text-sm text-muted-foreground">
                {totalTasks === 0
                  ? "Your outbound pipeline will appear here as agents work"
                  : `${completedTasks} completed · ${activeTasks} active · ${totalTasks} total tasks`}
              </p>
            </div>
            <IntegrationChain />
          </div>

          {/* Hero pipeline visualization */}
          <div className="py-8">
            <PipelineFlowViz onStageClick={setSelectedStage} />
          </div>

          {/* Stage labels */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground/40">
              Click a stage to see its contents · Active stages pulse when agents are working
            </p>
          </div>

          {/* Quick stats */}
          {totalTasks > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border/50 bg-card text-center">
                <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Tasks</p>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-card text-center">
                <p className="text-2xl font-bold text-green-500">{completedTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </div>
              <div className="p-4 rounded-xl border border-border/50 bg-card text-center">
                <p className="text-2xl font-bold" style={{ color: config.accentColor }}>{activeTasks}</p>
                <p className="text-xs text-muted-foreground mt-1">In Progress</p>
              </div>
            </div>
          )}

          {totalTasks === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Go to Home and launch an outbound campaign to see the pipeline in action.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stage detail drawer */}
      {selectedStage && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedStage(null)} />
          <StageDetailDrawer stageKey={selectedStage} onClose={() => setSelectedStage(null)} />
        </>
      )}
    </div>
  );
}
