import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentName, AGENT_CONFIG } from "@/types/mission";
import { getRelativeTime } from "@/lib/time";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

const CommandCenter = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("Kaze");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = useQuery(api.messages.listByConversation, { agentName: selectedAgent }) ?? [];
  const sendMessage = useMutation(api.messages.send);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedAgent, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage({
      from: "human",
      to: selectedAgent,
      content: input.trim(),
    });
    setInput("");
  };

  const agentConfig = AGENT_CONFIG[selectedAgent];

  return (
    <DashboardLayout>
      <div className="space-y-4 h-[calc(100vh-7rem)] flex flex-col">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Direct communication with agents</p>
        </div>

        {/* Agent selector */}
        <div className="flex gap-2">
          {(Object.keys(AGENT_CONFIG) as AgentName[]).map(name => {
            const config = AGENT_CONFIG[name];
            const isSelected = name === selectedAgent;
            return (
              <button
                key={name}
                onClick={() => setSelectedAgent(name)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  isSelected ? "border-transparent" : "border-border bg-card text-muted-foreground hover:bg-surface-hover"
                )}
                style={isSelected ? {
                  backgroundColor: `hsl(var(--agent-${config.color}) / 0.15)`,
                  color: `hsl(var(--agent-${config.color}))`,
                  borderColor: `hsl(var(--agent-${config.color}) / 0.3)`,
                } : {}}
              >
                <span>{config.emoji}</span>
                <span>{name}</span>
              </button>
            );
          })}
        </div>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-auto rounded-xl border border-border bg-card p-4 space-y-3">
          {messages.map(msg => {
            const isHuman = msg.from === "human";
            const msgConfig = !isHuman ? AGENT_CONFIG[msg.from as AgentName] : null;
            return (
              <div key={msg._id} className={cn("flex", isHuman ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] px-4 py-2.5 rounded-2xl text-sm",
                  isHuman ? "bg-secondary text-foreground rounded-br-md" : "rounded-bl-md"
                )} style={!isHuman && msgConfig ? {
                  backgroundColor: `hsl(var(--agent-${msgConfig.color}) / 0.1)`,
                  borderLeft: `2px solid hsl(var(--agent-${msgConfig.color}) / 0.3)`,
                } : {}}>
                  {!isHuman && msgConfig && (
                    <span className="text-xs font-medium mb-1 block" style={{ color: `hsl(var(--agent-${msgConfig.color}))` }}>
                      {msgConfig.emoji} {msg.from}
                    </span>
                  )}
                  <p className="text-foreground/90">{msg.content}</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block text-right">{getRelativeTime(msg.timestamp)}</span>
                </div>
              </div>
            );
          })}
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start a conversation with {selectedAgent}.
            </div>
          )}
        </div>

        {/* Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={`Message ${selectedAgent}...`}
              className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <button onClick={handleSend}
              className="px-4 rounded-xl transition-colors flex items-center"
              style={{ backgroundColor: `hsl(var(--agent-${agentConfig.color}))`, color: "white" }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 px-1">
            <Wifi className="w-3 h-3 text-status-online" />
            <span className="text-[10px] text-muted-foreground">Connected to Mission Control via Convex</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommandCenter;
