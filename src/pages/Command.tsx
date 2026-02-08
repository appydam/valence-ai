import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentName, AGENT_CONFIG } from "@/types/mission";
import { Send, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  from: "human" | AgentName;
  content: string;
  timestamp: number;
}

const initialMessages: Record<AgentName, ChatMessage[]> = {
  Kaze: [
    { id: "m1", from: "Kaze", content: "Squad status: all systems nominal. Scout is finishing the AI startup research, Forge is on the CI/CD pipeline. Ghost is standing by.", timestamp: Date.now() - 300000 },
    { id: "m2", from: "human", content: "Good. Let's prioritize the ProductHunt scraper after the pipeline is done.", timestamp: Date.now() - 240000 },
    { id: "m3", from: "Kaze", content: "Understood. I'll queue it as next priority for Forge. Estimated start: 2 hours.", timestamp: Date.now() - 180000 },
  ],
  Scout: [
    { id: "m4", from: "Scout", content: "I've identified 7 out of 10 agentic AI startups so far. Some interesting patterns in the funding data.", timestamp: Date.now() - 600000 },
  ],
  Forge: [
    { id: "m5", from: "Forge", content: "Pipeline config is about 60% done. Hit a snag with the container registry auth — working through it now.", timestamp: Date.now() - 900000 },
  ],
  Ghost: [
    { id: "m6", from: "Ghost", content: "Standing by for content tasks. I have a draft outline ready for the OpenClaw thread whenever you're ready to review.", timestamp: Date.now() - 1800000 },
  ],
};

const CommandCenter = () => {
  const [selectedAgent, setSelectedAgent] = useState<AgentName>("Kaze");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedAgent, messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMessage = {
      id: `m${Date.now()}`,
      from: "human",
      content: input.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => ({
      ...prev,
      [selectedAgent]: [...(prev[selectedAgent] || []), newMsg],
    }));
    setInput("");

    // Simulate agent response
    setTimeout(() => {
      const response: ChatMessage = {
        id: `m${Date.now() + 1}`,
        from: selectedAgent,
        content: "Acknowledged. I'll process this and get back to you shortly.",
        timestamp: Date.now(),
      };
      setMessages(prev => ({
        ...prev,
        [selectedAgent]: [...(prev[selectedAgent] || []), response],
      }));
    }, 1500);
  };

  const agentConfig = AGENT_CONFIG[selectedAgent];
  const currentMessages = messages[selectedAgent] || [];

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
          {currentMessages.map(msg => {
            const isHuman = msg.from === "human";
            const msgConfig = !isHuman ? AGENT_CONFIG[msg.from as AgentName] : null;
            return (
              <div key={msg.id} className={cn("flex", isHuman ? "justify-end" : "justify-start")}>
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
                </div>
              </div>
            );
          })}
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
            <WifiOff className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Not connected — UI shell mode. Wire up OpenClaw Gateway to enable live communication.</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CommandCenter;
