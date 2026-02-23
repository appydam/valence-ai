import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SquadView } from "@/components/SquadView";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

const Squad = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const tasks = useQuery(api.tasks.list, {}) ?? [];

  const selectedTask = selectedTaskId
    ? tasks.find((t) => t._id === selectedTaskId) ?? null
    : null;

  return (
    <DashboardLayout fullBleed>
      <div className="h-full flex flex-col">
        {/* Main scene — fills all available height, edge-to-edge */}
        <div className="flex-1 min-h-0 relative">
          <SquadView onTaskSelect={setSelectedTaskId} />
        </div>
      </div>

      {/* Task detail panel — same as board, slides from right */}
      {selectedTask && (
        <div className="fixed inset-y-0 right-0 z-50 w-[480px] shadow-2xl animate-slide-in-right">
          <TaskDetailPanel
            task={selectedTask as any}
            onClose={() => setSelectedTaskId(null)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Squad;
