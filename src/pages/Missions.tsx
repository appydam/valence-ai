import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { NewMissionModal } from "@/components/NewMissionModal";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, Archive, ExternalLink, FolderPlus } from "lucide-react";

const Missions = () => {
  const missions = useQuery(api.missions.list, {}) ?? [];
  const completeMission = useMutation(api.missions.complete);
  const archiveMission = useMutation(api.missions.archive);
  const [showNewMission, setShowNewMission] = useState(false);

  const handleComplete = async (missionId: Id<"missions">) => {
    if (confirm("Mark this mission as completed?")) {
      await completeMission({ missionId });
    }
  };

  const handleArchive = async (missionId: Id<"missions">) => {
    if (confirm("Archive this mission? It will be hidden from the active list.")) {
      await archiveMission({ missionId });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-blue-500 bg-blue-500/10";
      case "completed":
        return "text-green-500 bg-green-500/10";
      case "archived":
        return "text-gray-500 bg-gray-500/10";
      default:
        return "text-muted-foreground bg-secondary";
    }
  };

  const activeMissions = missions.filter((m) => m.status === "active");
  const completedMissions = missions.filter((m) => m.status === "completed");
  const archivedMissions = missions.filter((m) => m.status === "archived");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Missions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View all mission boards and their progress
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewMission(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Mission
            </button>
            <Link
              to="/board"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-surface-hover transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Go to Board
            </Link>
          </div>
        </div>

        {/* Active Missions */}
        {activeMissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Active Missions ({activeMissions.length})
            </h2>
            <div className="space-y-2">
              {activeMissions.map((mission) => (
                <div
                  key={mission._id}
                  className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {mission.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                            mission.status
                          )}`}
                        >
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {formatDate(mission.createdAt)}</span>
                        <span>
                          {mission.completedTaskCount}/{mission.taskCount} tasks completed
                        </span>
                        <span>by {mission.createdBy}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleComplete(mission._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleArchive(mission._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-hover transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Missions */}
        {completedMissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Completed Missions ({completedMissions.length})
            </h2>
            <div className="space-y-2">
              {completedMissions.map((mission) => (
                <div
                  key={mission._id}
                  className="p-4 rounded-lg bg-card border border-border opacity-75"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {mission.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                            mission.status
                          )}`}
                        >
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Completed {mission.completedAt ? formatDate(mission.completedAt) : "N/A"}</span>
                        <span>
                          {mission.completedTaskCount}/{mission.taskCount} tasks
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleArchive(mission._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-hover transition-colors"
                    >
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archived Missions */}
        {archivedMissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Archive className="w-5 h-5 text-gray-500" />
              Archived Missions ({archivedMissions.length})
            </h2>
            <div className="space-y-2">
              {archivedMissions.map((mission) => (
                <div
                  key={mission._id}
                  className="p-4 rounded-lg bg-card border border-border opacity-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {mission.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                            mission.status
                          )}`}
                        >
                          {mission.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {formatDate(mission.createdAt)}</span>
                        <span>
                          {mission.completedTaskCount}/{mission.taskCount} tasks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {missions.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Missions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a new mission to organize your squad's work
            </p>
            <button
              onClick={() => setShowNewMission(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              New Mission
            </button>
          </div>
        )}
      </div>

      {showNewMission && (
        <NewMissionModal
          onClose={() => setShowNewMission(false)}
          onCreate={() => setShowNewMission(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default Missions;
