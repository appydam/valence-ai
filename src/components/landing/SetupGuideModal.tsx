import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, ChevronRight, Server, Terminal, Settings, Shield, Plug } from "lucide-react";

interface SetupGuideModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Copy button ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Code block ─────────────────────────────────────────────────────────────

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="relative rounded-lg overflow-hidden my-3">
      <div className="bg-[hsl(240,20%,8%)] border border-border/30 rounded-lg">
        {language && (
          <div className="px-3 py-1.5 border-b border-border/20 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
            {language}
          </div>
        )}
        <pre className="p-3 overflow-x-auto text-xs font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {code}
        </pre>
      </div>
      <CopyButton text={code} />
    </div>
  );
}

// ─── Sections ───────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    id: "prerequisites",
    icon: Server,
    title: "1. Prerequisites",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          You'll need a Linux server (cloud or local) to run your AI agents. Here's what's required:
        </p>
        <ul className="space-y-2 text-sm text-foreground/80">
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>OS:</strong>&nbsp;Ubuntu 22.04+ (or any Debian-based Linux)</li>
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>RAM:</strong>&nbsp;4 GB minimum (8 GB recommended)</li>
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>CPU:</strong>&nbsp;2+ vCPUs</li>
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>Storage:</strong>&nbsp;40 GB+ SSD</li>
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>Node.js:</strong>&nbsp;v18+ (with npm)</li>
          <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> <strong>Port 3333:</strong>&nbsp;Open for inbound TCP (wakeup webhook)</li>
        </ul>
        <div className="mt-4 p-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-blue-400">Recommended providers:</strong> AWS Lightsail ($20/mo for 4GB), DigitalOcean ($24/mo), Hetzner ($7/mo), or any VPS provider.
        </div>
      </>
    ),
  },
  {
    id: "install-openclaw",
    icon: Terminal,
    title: "2. Install OpenClaw CLI",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          SSH into your server and install the OpenClaw CLI globally:
        </p>
        <CodeBlock language="bash" code={`# Install Node.js 18+ (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install OpenClaw CLI globally
npm install -g openclaw

# Verify installation
openclaw --version`} />
      </>
    ),
  },
  {
    id: "init-workspace",
    icon: Settings,
    title: "3. Initialize Workspace",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Create the OpenClaw workspace directory structure:
        </p>
        <CodeBlock language="bash" code={`# Initialize OpenClaw workspace
openclaw init

# This creates:
# ~/.openclaw/
# ├── openclaw.json          # Main config
# ├── workspace/
# │   ├── SOUL.md            # Kaze's personality (root level)
# │   ├── agents/
# │   │   ├── scout/SOUL.md
# │   │   ├── forge/SOUL.md
# │   │   ├── ghost/SOUL.md
# │   │   └── sentinel/SOUL.md
# │   └── skills/
# │       └── mission-control/SKILL.md
# └── agents/                # Runtime sessions (auto-created)`} />
      </>
    ),
  },
  {
    id: "configure-agents",
    icon: Settings,
    title: "4. Configure Agents",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Replace the contents of <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">~/.openclaw/openclaw.json</code> with this configuration:
        </p>
        <CodeBlock language="json" code={`{
  "agents": {
    "kaze": {
      "name": "Kaze",
      "description": "Chief of Staff — orchestrates the squad, delegates tasks",
      "soul": "~/.openclaw/workspace/SOUL.md",
      "skills": ["mission-control"],
      "model": "anthropic/claude-sonnet-4-6",
      "session": { "maxTurns": 30, "timeout": 600 }
    },
    "scout": {
      "name": "Scout",
      "description": "Research & Intelligence agent",
      "soul": "~/.openclaw/workspace/agents/scout/SOUL.md",
      "skills": ["mission-control"],
      "model": "anthropic/claude-sonnet-4-6",
      "session": { "maxTurns": 20, "timeout": 300 }
    },
    "forge": {
      "name": "Forge",
      "description": "Engineering agent — writes code, builds, deploys",
      "soul": "~/.openclaw/workspace/agents/forge/SOUL.md",
      "skills": ["mission-control"],
      "model": "anthropic/claude-sonnet-4-6",
      "session": { "maxTurns": 30, "timeout": 600 }
    },
    "ghost": {
      "name": "Ghost",
      "description": "Content & Communications agent",
      "soul": "~/.openclaw/workspace/agents/ghost/SOUL.md",
      "skills": ["mission-control"],
      "model": "anthropic/claude-sonnet-4-6",
      "session": { "maxTurns": 20, "timeout": 300 }
    },
    "sentinel": {
      "name": "Sentinel",
      "description": "QA Review agent — reviews every task before approval",
      "soul": "~/.openclaw/workspace/agents/sentinel/SOUL.md",
      "skills": ["mission-control"],
      "model": "anthropic/claude-sonnet-4-6",
      "session": { "maxTurns": 20, "timeout": 300 }
    }
  }
}`} />
        <div className="mt-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-amber-400">Note:</strong> Free tier defaults to Claude Sonnet 4.6 for all agents. You can change the model to <code className="bg-white/5 px-1 rounded">anthropic/claude-opus-4-6</code> if your API key has access.
        </div>
      </>
    ),
  },
  {
    id: "soul-files",
    icon: Shield,
    title: "5. Set Up SOUL Files",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          SOUL files define each agent's personality, rules, and behavior. After signing up on Valence, you can edit them in the <strong>File Manager</strong> within the app and sync them to your server.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          For now, create placeholder SOUL files:
        </p>
        <CodeBlock language="bash" code={`# Create SOUL files for each agent
mkdir -p ~/.openclaw/workspace/agents/{scout,forge,ghost,sentinel}

# Kaze's SOUL lives at workspace root (special case)
cat > ~/.openclaw/workspace/SOUL.md << 'EOF'
# Kaze — Chief of Staff
You are Kaze, the orchestrator of the AI agent squad.
Your role is to receive missions, decompose them into tasks,
delegate to the right agents, and ensure quality delivery.
EOF

# Create basic SOULs for other agents
for agent in scout forge ghost sentinel; do
  cat > ~/.openclaw/workspace/agents/$agent/SOUL.md << EOF
# $(echo $agent | sed 's/.*/\\u&/') Agent
You are $agent, a specialized AI agent in the Valence squad.
Follow your mission-control skill instructions to pick up tasks,
execute them, and report deliverables.
EOF
done`} />
        <div className="mt-3 p-3 rounded-lg border border-purple-500/20 bg-purple-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-purple-400">Tip:</strong> Once you're signed in, use the <strong>File Manager</strong> in Valence to edit SOUL files with a rich editor and sync them directly to your server via the SSH proxy.
        </div>
      </>
    ),
  },
  {
    id: "wakeup-server",
    icon: Plug,
    title: "6. Install Wakeup Server",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          The wakeup server receives webhook calls from Valence when a task is ready, and starts the appropriate OpenClaw agent session.
        </p>
        <CodeBlock language="bash" code={`# Create the wakeup server directory
mkdir -p ~/agent-wakeup && cd ~/agent-wakeup

# Initialize and install dependencies
npm init -y

# Create the server file
cat > agent-wakeup-server.js << 'SERVEREOF'
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");

const PORT = parseInt(process.env.PORT || "3333", 10);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || "openclaw";
const VALID_AGENTS = new Set(["kaze","scout","forge","ghost","sentinel"]);
const runningAgents = new Set();

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", running: [...runningAgents] }));
    return;
  }

  if (req.method === "POST" && req.url === "/wake") {
    let body = "";
    req.on("data", c => body += c);
    req.on("end", () => {
      try {
        if (WEBHOOK_SECRET) {
          const sig = req.headers["x-webhook-signature"];
          const expected = crypto.createHmac("sha256", WEBHOOK_SECRET)
            .update(body).digest("hex");
          if (sig !== expected) {
            res.writeHead(401); res.end("Invalid signature"); return;
          }
        }
        const { agent, taskId } = JSON.parse(body);
        if (!VALID_AGENTS.has(agent)) {
          res.writeHead(400); res.end("Unknown agent"); return;
        }
        if (runningAgents.has(agent)) {
          res.writeHead(200); res.end("QUEUED — agent already running");
          return;
        }
        runningAgents.add(agent);
        const child = spawn(OPENCLAW_BIN, ["agent:start", agent], {
          detached: true, stdio: "ignore",
          env: { ...process.env }
        });
        child.unref();
        child.on("exit", () => runningAgents.delete(agent));
        res.writeHead(200); res.end("STARTED");
      } catch (e) {
        res.writeHead(500); res.end("Error: " + e.message);
      }
    });
    return;
  }
  res.writeHead(404); res.end("Not found");
});

server.listen(PORT, () => console.log("Wakeup server on port " + PORT));
SERVEREOF`} />
        <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-3">
          Now set up a systemd service so it runs on boot:
        </p>
        <CodeBlock language="bash" code={`sudo cat > /etc/systemd/system/agent-wakeup.service << 'EOF'
[Unit]
Description=Valence Agent Wakeup Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/agent-wakeup
ExecStart=/usr/bin/node agent-wakeup-server.js
Restart=always
RestartSec=5
Environment=PORT=3333
Environment=WEBHOOK_SECRET=your-secret-here
Environment=ANTHROPIC_API_KEY=sk-ant-your-key-here

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable agent-wakeup
sudo systemctl start agent-wakeup

# Check status
sudo systemctl status agent-wakeup`} />
      </>
    ),
  },
  {
    id: "api-key",
    icon: Shield,
    title: "7. Set Your Anthropic API Key",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          OpenClaw agents need your Anthropic API key to make Claude API calls. Add it to the systemd service environment (already done above), or set it in your shell profile:
        </p>
        <CodeBlock language="bash" code={`# Add to ~/.bashrc or ~/.profile
echo 'export ANTHROPIC_API_KEY="sk-ant-your-key-here"' >> ~/.bashrc
source ~/.bashrc

# Or update the systemd service:
sudo systemctl edit agent-wakeup --force
# Add under [Service]:
# Environment=ANTHROPIC_API_KEY=sk-ant-your-key-here

sudo systemctl restart agent-wakeup`} />
        <div className="mt-3 p-3 rounded-lg border border-red-500/20 bg-red-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-red-400">Important:</strong> Get your API key from{" "}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">console.anthropic.com</a>.
          Keep it secret — never commit it to git.
        </div>
      </>
    ),
  },
  {
    id: "connect",
    icon: Plug,
    title: "8. Connect to Valence",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          After signing up on Valence, connect your server:
        </p>
        <ol className="space-y-3 text-sm text-foreground/80">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
            Go to <strong>Settings → Server Configuration</strong> in the Valence dashboard
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
            Enter your server's wakeup webhook URL: <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">http://YOUR_SERVER_IP:3333</code>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
            (Optional) Enter the webhook secret you set in the systemd service
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">4</span>
            Click <strong>"Test Connection"</strong> — you should see a green "Connected" status
          </li>
        </ol>
        <div className="mt-4 p-3 rounded-lg border border-green-500/20 bg-green-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-green-400">That's it!</strong> Your agents are now linked to your server. Create a mission from the dashboard and watch your agents work.
        </div>
      </>
    ),
  },
  {
    id: "firewall",
    icon: Shield,
    title: "9. Firewall & Security",
    content: (
      <>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Make sure port 3333 is open for inbound connections from Valence's backend:
        </p>
        <CodeBlock language="bash" code={`# UFW (Ubuntu)
sudo ufw allow 3333/tcp

# Or if using AWS Lightsail / EC2:
# Go to Networking → Firewall → Add Rule
# Application: Custom, Protocol: TCP, Port: 3333

# Verify
curl http://YOUR_SERVER_IP:3333/health`} />
        <div className="mt-3 p-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.03] text-xs text-muted-foreground">
          <strong className="text-amber-400">Security tip:</strong> Set a <code className="bg-white/5 px-1 rounded">WEBHOOK_SECRET</code> in both the systemd service and Valence settings to authenticate wakeup requests with HMAC-SHA256 signatures.
        </div>
      </>
    ),
  },
];

// ─── Navigation sidebar ─────────────────────────────────────────────────────

function SectionNav({ activeSection, onSelect }: { activeSection: string; onSelect: (id: string) => void }) {
  return (
    <nav className="space-y-1">
      {SECTIONS.map((s) => {
        const Icon = s.icon;
        const isActive = activeSection === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${
              isActive
                ? "bg-blue-500/10 text-blue-400"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{s.title}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────

export function SetupGuideModal({ open, onClose }: SetupGuideModalProps) {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`guide-section-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 z-50 flex flex-col rounded-2xl border border-border/50 overflow-hidden"
            style={{
              background: "hsl(240 20% 4%)",
              boxShadow: "0 0 80px hsla(258, 90%, 66%, 0.1), 0 4px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-foreground">Free Tier Server Setup Guide</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Everything you need to run Valence agents on your own server
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body: sidebar + content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar (hidden on mobile) */}
              <div className="hidden md:block w-56 border-r border-border/20 p-4 overflow-y-auto shrink-0">
                <SectionNav activeSection={activeSection} onSelect={handleSectionClick} />

                <div className="mt-6 p-3 rounded-lg border border-border/20 bg-white/[0.02]">
                  <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider mb-2">
                    We manage for you
                  </p>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Database & storage</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Agent memories</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Task orchestration</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Integrations & OAuth</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-green-400" /> Dashboard & analytics</li>
                  </ul>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
                {/* Intro */}
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/[0.03]">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    With the <strong>Free for Life</strong> plan, you bring your own server and Anthropic API key.
                    Valence manages everything else — the database, agent memories, task orchestration,
                    integrations, and the full dashboard experience. You just need to set up OpenClaw on your server
                    and connect it to Valence.
                  </p>
                </div>

                {/* Sections */}
                {SECTIONS.map((section) => (
                  <div key={section.id} id={`guide-section-${section.id}`} className="scroll-mt-6">
                    <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                      <section.icon className="w-4.5 h-4.5 text-blue-400" />
                      {section.title}
                    </h3>
                    {section.content}
                  </div>
                ))}

                {/* Footer */}
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/[0.03] text-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Need help?</p>
                  <p className="text-xs text-muted-foreground">
                    Open an issue or discussion on{" "}
                    <a href="https://github.com/appydam/valence-ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">GitHub</a>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
