import { useState } from "react";
import { UserSearch, Sparkles, Send, Loader2, Mail, Linkedin, CheckCircle2, Clock } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useUserTasks } from "@/hooks/useUserScoped";

export function ContactFinder() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [prompt, setPrompt] = useState("");

  const tasks = useUserTasks();
  const contactTasks = (tasks ?? [])
    .filter((t: { tags?: string[] }) =>
      t.tags?.includes("niche:outbound") && t.tags?.includes("stage:contacts")
    )
    .sort((a: { _creationTime: number }, b: { _creationTime: number }) => b._creationTime - a._creationTime);

  const handleSearch = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    await triggerAgent(
      "Scout",
      `Find contacts: ${text.length > 60 ? text.slice(0, 60) + "..." : text}`,
      `User request from AI Outbound Engine — Contact Discovery:\n\n"${text}"\n\nIMPORTANT: Do NOT use Apollo credits for research. Use FREE web sources:\n- LinkedIn public profiles (web_fetch on linkedin.com/in/...)\n- Company websites /about or /team pages\n- Google search: "person name" + "company" + site:linkedin.com\n- Crunchbase for company/founder info\n- Job boards for org structure hints\n\nFor each contact found, return: full name, job title, company, LinkedIn URL, and any email pattern you can detect (e.g. firstname@company.com). Prioritize VP/Director/C-level contacts.\n\nOnly use Apollo organization_enrich (by domain) to get company details — this is free. Do NOT call people_enrich or people_search as those cost credits.\n\nDeliver as a structured list.`,
      ["niche:outbound", "stage:contacts"],
      { priority: "high" }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
        <p className="text-sm text-muted-foreground">Find decision-makers at target companies via Apollo</p>
      </div>

      {/* Search */}
      <div
        className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
        style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
      >
        <UserSearch className="w-4 h-4 shrink-0" style={{ color: config.accentColor }} />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder='e.g., "VP Operations at my target companies" or "CTOs at Series B fintech startups"'
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={!prompt.trim() || agentLoading}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
          style={{ background: config.accentColor }}
        >
          {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          "Find VP Ops at my target companies",
          "CTOs at Series B SaaS startups",
          "Head of Growth at e-commerce brands",
          "RevOps leaders at 100-500 employee companies",
        ].map((s) => (
          <button
            key={s}
            onClick={() => setPrompt(s)}
            className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Contact task results */}
      {contactTasks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Contact Discovery Tasks</h2>
          {contactTasks.map((task: {
            _id: string;
            title: string;
            status: string;
            assignee?: string;
            deliverables?: { name: string; content: string }[];
          }) => {
            const isDone = task.status === "done";
            const isWorking = task.status === "in_progress";
            return (
              <div key={task._id} className="px-4 py-3 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                  ) : isWorking ? (
                    <Loader2 className="w-4 h-4 mt-0.5 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 mt-0.5 text-yellow-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{task.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignee}</p>
                    {isDone && task.deliverables && task.deliverables.length > 0 && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-accent/20 text-xs text-foreground/70 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {task.deliverables[0].content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {contactTasks.length === 0 && (
        <div className="text-center py-12">
          <UserSearch className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Search for contacts or launch from the Home page</p>
        </div>
      )}
    </div>
  );
}
