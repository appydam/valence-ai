import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { NewTaskModal } from "@/components/NewTaskModal";
import { mockTasks } from "@/data/mock";
import { Task, TaskStatus, AgentName, TaskPriority } from "@/types/mission";
import { Plus } from "lucide-react";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "inbox", label: "Inbox" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "done", label: "Done" },
];

const Board = () => {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);

  const handleUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleCreate = (data: { title: string; description: string; priority: TaskPriority; assignee?: AgentName; tags: string[] }) => {
    const newTask: Task = {
      id: `t${Date.now()}`,
      title: data.title,
      description: data.description,
      status: data.assignee ? "assigned" : "inbox",
      priority: data.priority,
      assignee: data.assignee,
      creator: "Human",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: data.tags,
      deliverables: [],
    };
    setTasks(prev => [...prev, newTask]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mission Board</h1>
            <p className="text-sm text-muted-foreground mt-1">Track and manage squad tasks</p>
          </div>
          <button onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors">
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>

        {/* Kanban */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{col.label}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(task => (
                    <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="p-6 rounded-lg border border-dashed border-border text-center">
                      <p className="text-xs text-muted-foreground">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updates) => handleUpdate(selectedTask.id, updates)}
          onDelete={() => handleDelete(selectedTask.id)}
        />
      )}

      {/* New task modal */}
      {showNewTask && (
        <NewTaskModal onClose={() => setShowNewTask(false)} onCreate={handleCreate} />
      )}
    </DashboardLayout>
  );
};

export default Board;
